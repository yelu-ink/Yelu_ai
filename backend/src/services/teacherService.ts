import { Op } from 'sequelize';
import { User, AuthorizedStudent, Application } from '../models';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';
import { generateUsername, generatePassword } from '../utils/pinyin';

const DEFAULT_CLASS_NAME = '未分班';

export class TeacherService {
  // 导入授权学生名单
  static async importAuthorizedStudents(
    students: Array<{ name: string; className: string }>,
    teacherId: number
  ) {
    const transaction = await sequelize.transaction();

    try {
      const results = [];
      
      for (const student of students) {
        const [record, created] = await AuthorizedStudent.findOrCreate({
          where: {
            name: student.name,
            className: student.className,
          },
          defaults: {
            name: student.name,
            className: student.className,
            isUsed: false,
          } as any,
          transaction,
        });

        if (!created) {
          // 如果已存在，更新为未使用状态（允许重新导入）
          await record.update(
            { isUsed: false, usedByUserId: null } as any,
            { transaction }
          );
        }

        results.push(record);
      }

      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 获取老师管理的所有学生
  static async getManagedStudents(teacherId: number, className?: string) {
    const where: any = {};
    
    if (className) {
      where.className = className;
    }

    const students = await AuthorizedStudent.findAll({
      where,
      include: [
        {
          model: User,
          as: 'manager',
          where: { id: teacherId },
          required: false,
        },
      ],
      order: [['className', 'ASC'], ['name', 'ASC']],
    });

    return students;
  }

  // 获取班级列表
  static async getClassNames(teacherId: number) {
    const students = await AuthorizedStudent.findAll({
      attributes: ['className'],
      group: ['className'],
      raw: true,
    });

    return students.map((s: any) => s.className).filter(Boolean);
  }

  // 获取某个班级的统计数据
  static async getClassStatistics(className: string, teacherId: number) {
    // 获取该班级的所有学生用户
    const studentUsers = await User.findAll({
      where: {
        className,
        role: 'student',
      },
      attributes: ['id', 'name', 'username'],
    });

    const studentIds = studentUsers.map((u) => u.id);

    // 获取投递记录
    const applications = await Application.findAll({
      where: {
        userId: {
          [Op.in]: studentIds,
        },
      },
    });

    const totalApplications = applications.length;
    const studentCount = studentUsers.length;
    const avgApplications = studentCount > 0 ? (totalApplications / studentCount).toFixed(2) : '0';

    // 状态分布
    const statusCount: Record<string, number> = {};
    applications.forEach((app) => {
      const status = app.status || '未设置';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const countRows = studentIds.length > 0
      ? (await Application.findAll({
          attributes: [
            'userId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          ],
          where: { userId: { [Op.in]: studentIds } },
          group: ['userId'],
          raw: true,
        }) as unknown as Array<{ userId: number; count: string }>)
      : [];

    const countMap = new Map<number, number>(
      countRows.map((row) => [row.userId, Number(row.count)])
    );

    const studentRanks = studentUsers
      .map((student) => ({
        studentId: student.id,
        studentName: student.name,
        count: countMap.get(student.id) || 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      className,
      studentCount,
      totalApplications,
      avgApplications,
      statusCount,
      studentRanks,
    };
  }

  // 获取所有班级的汇总统计
  static async getOverallStatistics(teacherId: number) {
    const classNamesFromAuth = await this.getClassNames(teacherId);
    const classNamesFromUsers = await User.findAll({
      where: { role: 'student' },
      attributes: ['className'],
      group: ['className'],
      raw: true,
    });

    const classNames = [...new Set([
      ...classNamesFromAuth,
      ...(classNamesFromUsers as Array<{ className: string }>)
        .map((item) => item.className)
        .filter(Boolean),
    ])];

    const totalStudents = await User.count({ where: { role: 'student' } });
    const studentIds = (await User.findAll({
      where: { role: 'student' },
      attributes: ['id'],
    })).map((user) => user.id);

    const overallStats = {
      totalClasses: classNames.length,
      totalStudents,
      totalApplications: 0,
      statusCount: {} as Record<string, number>,
    };

    if (studentIds.length > 0) {
      const applications = await Application.findAll({
        where: { userId: { [Op.in]: studentIds } },
        attributes: ['status'],
      });

      overallStats.totalApplications = applications.length;
      applications.forEach((app) => {
        const status = app.status || '未设置';
        overallStats.statusCount[status] = (overallStats.statusCount[status] || 0) + 1;
      });
    }

    return overallStats;
  }

  // 获取所有投递记录（带筛选）
  static async getAllApplications(
    teacherId: number,
    filters?: {
      className?: string;
      status?: string;
      channel?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    // 获取该老师管理的所有学生
    const where: any = {};
    
    if (filters?.className) {
      where.className = filters.className;
    }

    const authorizedStudents = await AuthorizedStudent.findAll({
      where,
      attributes: ['name', 'className'],
    });

    // 获取对应的用户 ID
    const studentNames = authorizedStudents.map((s) => s.name);
    const classNames = [...new Set(authorizedStudents.map((s) => s.className))];

    const studentUsers = await User.findAll({
      where: {
        name: { [Op.in]: studentNames },
        className: { [Op.in]: classNames },
        role: 'student',
      },
      attributes: ['id', 'name', 'className'],
    });

    const studentIds = studentUsers.map((u) => u.id);

    // 构建投递记录查询条件
    const appWhere: any = {
      userId: { [Op.in]: studentIds },
    };

    if (filters?.status) {
      appWhere.status = filters.status;
    }
    if (filters?.channel) {
      appWhere.channel = filters.channel;
    }
    if (filters?.type) {
      appWhere.type = filters.type;
    }
    if (filters?.startDate || filters?.endDate) {
      appWhere.applicationDate = {};
      if (filters.startDate) {
        appWhere.applicationDate[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        appWhere.applicationDate[Op.lte] = filters.endDate;
      }
    }

    const applications = await Application.findAll({
      where: appWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'className'],
        },
      ],
      order: [['applicationDate', 'DESC']],
    });

    return applications;
  }

  static async resolveUniqueUsername(name: string): Promise<string> {
    const baseUsername = generateUsername(name);

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = attempt === 0
        ? baseUsername
        : `${baseUsername}${Math.floor(Math.random() * 900) + 100}`;

      const existingUser = await User.findOne({ where: { username: candidate } });
      if (!existingUser) {
        return candidate;
      }
    }

    throw new Error('无法生成唯一用户名，请稍后重试');
  }

  static async getStudentsOverview(_teacherId: number) {
    const studentUsers = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'className', 'username', 'plainPassword'],
      order: [['name', 'ASC']],
    });

    if (studentUsers.length === 0) {
      return [];
    }

    const studentIds = studentUsers.map((user) => user.id);
    const applications = await Application.findAll({
      where: { userId: { [Op.in]: studentIds } },
      attributes: ['userId', 'status'],
    });

    const statsMap = new Map<number, {
      totalApplications: number;
      statusCount: Record<string, number>;
    }>();

    studentIds.forEach((id) => {
      statsMap.set(id, { totalApplications: 0, statusCount: {} });
    });

    applications.forEach((app) => {
      const stats = statsMap.get(app.userId);
      if (!stats) return;

      stats.totalApplications += 1;
      const status = app.status || '未设置';
      stats.statusCount[status] = (stats.statusCount[status] || 0) + 1;
    });

    return studentUsers.map((user) => {
      const stats = statsMap.get(user.id)!;
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        password: user.plainPassword || '',
        className: user.className || DEFAULT_CLASS_NAME,
        totalApplications: stats.totalApplications,
        statusCount: stats.statusCount,
      };
    }).sort((a, b) => b.totalApplications - a.totalApplications);
  }

  // 创建学生账号
  static async createStudentAccount(
    name: string,
    major?: string,
    studentLink?: string
  ) {
    const trimmedName = name.trim();
    const username = await this.resolveUniqueUsername(trimmedName);
    const password = generatePassword(trimmedName);
    const className = major?.trim() || DEFAULT_CLASS_NAME;
    const transaction = await sequelize.transaction();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        password: hashedPassword,
        plainPassword: password,
        name: trimmedName,
        className,
        role: 'student',
      }, { transaction });

      await AuthorizedStudent.create({
        name: trimmedName,
        className,
        isUsed: true,
        usedByUserId: user.id,
      }, { transaction });

      await transaction.commit();

      return {
        userId: user.id,
        username: user.username,
        password,
        className,
        studentLink: studentLink?.trim() || '',
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default TeacherService;
