"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const maskName_1 = require("../utils/maskName");
const DEFAULT_CLASS_NAME = '未分班';
class ApplicationService {
    static async createApplication(userId, data) {
        const application = await models_1.Application.create({
            userId,
            ...data,
        });
        return application;
    }
    static async getUserApplications(userId, filters) {
        const where = { userId };
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
                    where.applicationDate[sequelize_1.Op.gte] = filters.startDate;
                }
                if (filters.endDate) {
                    where.applicationDate[sequelize_1.Op.lte] = filters.endDate;
                }
            }
            if (filters.company) {
                where.company = { [sequelize_1.Op.like]: `%${filters.company}%` };
            }
            if (filters.position) {
                where.position = { [sequelize_1.Op.like]: `%${filters.position}%` };
            }
        }
        const applications = await models_1.Application.findAll({
            where,
            order: [['applicationDate', 'DESC']],
        });
        return applications;
    }
    static async getApplicationById(id, userId) {
        const application = await models_1.Application.findOne({
            where: { id, userId },
        });
        if (!application) {
            throw new Error('投递记录不存在');
        }
        return application;
    }
    static async updateApplication(id, userId, updates) {
        const application = await this.getApplicationById(id, userId);
        await application.update(updates);
        return application;
    }
    static async deleteApplication(id, userId) {
        const application = await this.getApplicationById(id, userId);
        await application.destroy();
        return true;
    }
    static async getStatistics(userId) {
        const applications = await models_1.Application.findAll({
            where: { userId },
            attributes: ['status', 'type', 'channel'],
        });
        const total = applications.length;
        const statusCount = {};
        const typeCount = {};
        const channelCount = {};
        applications.forEach((app) => {
            const status = app.status || '未设置';
            const type = app.type || '未设置';
            const channel = app.channel || '未设置';
            statusCount[status] = (statusCount[status] || 0) + 1;
            typeCount[type] = (typeCount[type] || 0) + 1;
            channelCount[channel] = (channelCount[channel] || 0) + 1;
        });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentApplications = await models_1.Application.findAll({
            where: {
                userId,
                applicationDate: { [sequelize_1.Op.gte]: sevenDaysAgo.toISOString().split('T')[0] },
            },
            attributes: ['applicationDate'],
            order: [['applicationDate', 'ASC']],
        });
        const trendData = {};
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
    static async getApplicationRanking(currentUserId) {
        const currentUser = await models_1.User.findOne({
            where: { id: currentUserId, role: 'student' },
            attributes: ['id', 'teacherId'],
        });
        if (!currentUser) {
            throw new Error('学生不存在');
        }
        const studentWhere = { role: 'student' };
        if (currentUser.teacherId) {
            studentWhere.teacherId = currentUser.teacherId;
        }
        else {
            studentWhere.id = currentUserId;
        }
        const studentUsers = await models_1.User.findAll({
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
        const applications = await models_1.Application.findAll({
            where: { userId: { [sequelize_1.Op.in]: studentIds } },
            attributes: ['userId'],
        });
        const countMap = new Map();
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
        const rankings = [];
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
                maskedName: (0, maskName_1.maskStudentName)(student.name),
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
}
exports.ApplicationService = ApplicationService;
exports.default = ApplicationService;
//# sourceMappingURL=applicationService.js.map