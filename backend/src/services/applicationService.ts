import { Op, WhereOptions } from 'sequelize';
import { Application, User } from '../models';
import { maskStudentName } from '../utils/maskName';

const DEFAULT_CLASS_NAME = '未分班';

const RECOMMEND_STATUSES = ['笔试/测评', '面试中', 'OC', 'Offer', '已拒'];

interface ApplicationFilters {
  channel?: string;
  type?: string;
  status?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  company?: string;
  position?: string;
}

export class ApplicationService {
  // 创建投递记录
  static async createApplication(
    userId: number,
    data: {
      company: string;
      position: string;
      applicationDate: string;
      channel?: string;
      type?: string;
      status?: string;
      statusDate?: string;
      location?: string;
      referralCode?: string;
      priority?: number;
      remarks?: string;
    }
  ) {
    const application = await Application.create({
      userId,
      ...data,
    });

    return application;
  }

  // 获取用户的投递记录
  static async getUserApplications(userId: number, filters?: ApplicationFilters) {
    const where: WhereOptions<Application> = { userId };

    if (filters) {
      if (filters.channel) {
        where.channel = filters.channel;
      }
      if (filters.type) {
        where.type = filters.type;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.priority) {
        where.priority = filters.priority;
      }
      if (filters.startDate || filters.endDate) {
        where.applicationDate = {};
        if (filters.startDate) {
          (where.applicationDate as any)[Op.gte] = filters.startDate;
        }
        if (filters.endDate) {
          (where.applicationDate as any)[Op.lte] = filters.endDate;
        }
      }
      if (filters.company) {
        where.company = { [Op.like]: `%${filters.company}%` };
      }
      if (filters.position) {
        where.position = { [Op.like]: `%${filters.position}%` };
      }
    }

    const applications = await Application.findAll({
      where,
      order: [['applicationDate', 'DESC']],
    });

    return applications;
  }

  // 获取单个投递记录
  static async getApplicationById(id: number, userId: number) {
    const application = await Application.findOne({
      where: { id, userId },
    });

    if (!application) {
      throw new Error('投递记录不存在');
    }

    return application;
  }

  // 更新投递记录
  static async updateApplication(
    id: number,
    userId: number,
    updates: Partial<Application>
  ) {
    const application = await this.getApplicationById(id, userId);
    
    await application.update(updates);
    
    return application;
  }

  // 删除投递记录
  static async deleteApplication(id: number, userId: number) {
    const application = await this.getApplicationById(id, userId);
    
    await application.destroy();
    
    return true;
  }

  static async countRecentApplications(userId: number, days = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Application.count({
      where: {
        userId,
        applicationDate: { [Op.gte]: startDate.toISOString().split('T')[0] },
      },
    });
  }

  // 获取统计数据
  static async getStatistics(userId: number) {
    const applications = await Application.findAll({
      where: { userId },
      attributes: ['status', 'type', 'channel'],
    });

    const total = applications.length;
    
    const statusCount: Record<string, number> = {};
    const typeCount: Record<string, number> = {};
    const channelCount: Record<string, number> = {};

    applications.forEach((app) => {
      const status = app.status || '未设置';
      const type = app.type || '未设置';
      const channel = app.channel || '未设置';

      statusCount[status] = (statusCount[status] || 0) + 1;
      typeCount[type] = (typeCount[type] || 0) + 1;
      channelCount[channel] = (channelCount[channel] || 0) + 1;
    });

    // 获取最近 7 天的投递趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentApplications = await Application.findAll({
      where: {
        userId,
        applicationDate: { [Op.gte]: sevenDaysAgo.toISOString().split('T')[0] },
      },
      attributes: ['applicationDate'],
      order: [['applicationDate', 'ASC']],
    });

    const trendData: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendData[dateStr] = 0;
    }

    recentApplications.forEach((app) => {
      const dateStr = app.applicationDate;
      if (trendData[dateStr] !== undefined) {
        trendData[dateStr]++;
      }
    });

    return {
      total,
      statusCount,
      typeCount,
      channelCount,
      trend: trendData,
    };
  }

  static async getApplicationRanking(currentUserId: number) {
    const currentUser = await User.findOne({
      where: { id: currentUserId, role: 'student' },
      attributes: ['id', 'teacherId'],
    });

    if (!currentUser) {
      throw new Error('学生不存在');
    }

    const studentWhere: any = { role: 'student' };
    if (currentUser.teacherId) {
      studentWhere.teacherId = currentUser.teacherId;
    } else {
      studentWhere.id = currentUserId;
    }

    const studentUsers = await User.findAll({
      where: studentWhere,
      attributes: ['id', 'name', 'className'],
    });

    const totalStudents = studentUsers.length;

    if (totalStudents === 0) {
      return {
        rankings: [],
        currentRank: 0,
        totalStudents: 0,
        isBottom40: false,
      };
    }

    const studentIds = studentUsers.map((user) => user.id);
    const applications = await Application.findAll({
      where: { userId: { [Op.in]: studentIds } },
      attributes: ['userId'],
    });

    const countMap = new Map<number, number>();
    studentIds.forEach((id) => countMap.set(id, 0));
    applications.forEach((app) => {
      countMap.set(app.userId, (countMap.get(app.userId) || 0) + 1);
    });

    const sortedStudents = studentUsers
      .map((user) => ({
        id: user.id,
        name: user.name,
        className: user.className || DEFAULT_CLASS_NAME,
        totalApplications: countMap.get(user.id) || 0,
      }))
      .sort((a, b) => b.totalApplications - a.totalApplications);

    let currentRank = 0;
    const rankings: Array<{
      rank: number;
      maskedName: string;
      className: string;
      totalApplications: number;
      isCurrentUser: boolean;
    }> = [];

    for (let i = 0; i < sortedStudents.length; i++) {
      const student = sortedStudents[i];
      const rank = i === 0 || student.totalApplications < sortedStudents[i - 1].totalApplications
        ? i + 1
        : rankings[i - 1].rank;

      const isCurrentUser = student.id === currentUserId;
      if (isCurrentUser) {
        currentRank = rank;
      }

      rankings.push({
        rank,
        maskedName: maskStudentName(student.name),
        className: student.className,
        totalApplications: student.totalApplications,
        isCurrentUser,
      });
    }

    const isBottom40 = currentRank > Math.floor(totalStudents * 0.6);
    const warningMessage = isBottom40
      ? `您当前的校招投递量排名为${currentRank}名，整体数量排名靠后，请及时进行简历投递，避免错过机会！`
      : undefined;

    return {
      rankings,
      currentRank,
      totalStudents,
      isBottom40,
      warningMessage,
    };
  }

  static async getApplicationRecommendations() {
    const studentUsers = await User.findAll({
      where: { role: 'student' },
      attributes: ['id'],
    });

    if (studentUsers.length === 0) {
      return [];
    }

    const studentIds = studentUsers.map((user) => user.id);
    const applications = await Application.findAll({
      where: {
        userId: { [Op.in]: studentIds },
        status: { [Op.in]: RECOMMEND_STATUSES },
      },
      attributes: ['company', 'position', 'applicationDate', 'channel', 'type', 'location', 'status', 'updatedAt'],
      order: [['updatedAt', 'DESC']],
    });

    const dedupeMap = new Map<
      string,
      {
        company: string;
        position: string;
        applicationDate: string;
        channel?: string;
        type?: string;
        location?: string;
        status?: string;
        applicationCount: number;
      }
    >();

    applications.forEach((app) => {
      const key = `${app.company.trim().toLowerCase()}|${app.position.trim().toLowerCase()}`;
      const existing = dedupeMap.get(key);

      if (!existing) {
        dedupeMap.set(key, {
          company: app.company,
          position: app.position,
          applicationDate: app.applicationDate,
          channel: app.channel,
          type: app.type,
          location: app.location,
          status: app.status,
          applicationCount: 1,
        });
        return;
      }

      existing.applicationCount += 1;
    });

    return Array.from(dedupeMap.values()).sort(
      (a, b) => b.applicationDate.localeCompare(a.applicationDate)
    );
  }
}

export default ApplicationService;
