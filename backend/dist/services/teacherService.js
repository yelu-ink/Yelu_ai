"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pinyin_1 = require("../utils/pinyin");
const DEFAULT_CLASS_NAME = '未分班';
class TeacherService {
    static async importAuthorizedStudents(students, teacherId) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const results = [];
            for (const student of students) {
                const [record, created] = await models_1.AuthorizedStudent.findOrCreate({
                    where: {
                        name: student.name,
                        className: student.className,
                    },
                    defaults: {
                        name: student.name,
                        className: student.className,
                        isUsed: false,
                    },
                    transaction,
                });
                if (!created) {
                    await record.update({ isUsed: false, usedByUserId: null }, { transaction });
                }
                results.push(record);
            }
            await transaction.commit();
            return results;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    static async getManagedStudents(teacherId, className) {
        const where = {};
        if (className) {
            where.className = className;
        }
        const students = await models_1.AuthorizedStudent.findAll({
            where,
            include: [
                {
                    model: models_1.User,
                    as: 'manager',
                    where: { id: teacherId },
                    required: false,
                },
            ],
            order: [['className', 'ASC'], ['name', 'ASC']],
        });
        return students;
    }
    static async getClassNames(teacherId) {
        const students = await models_1.AuthorizedStudent.findAll({
            attributes: ['className'],
            group: ['className'],
            raw: true,
        });
        return students.map((s) => s.className).filter(Boolean);
    }
    static async getClassStatistics(className, teacherId) {
        const studentUsers = await models_1.User.findAll({
            where: {
                className,
                role: 'student',
            },
            attributes: ['id', 'name', 'username'],
        });
        const studentIds = studentUsers.map((u) => u.id);
        const applications = await models_1.Application.findAll({
            where: {
                userId: {
                    [sequelize_1.Op.in]: studentIds,
                },
            },
        });
        const totalApplications = applications.length;
        const studentCount = studentUsers.length;
        const avgApplications = studentCount > 0 ? (totalApplications / studentCount).toFixed(2) : '0';
        const statusCount = {};
        applications.forEach((app) => {
            const status = app.status || '未设置';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        const countRows = studentIds.length > 0
            ? await models_1.Application.findAll({
                attributes: [
                    'userId',
                    [database_1.sequelize.fn('COUNT', database_1.sequelize.col('id')), 'count'],
                ],
                where: { userId: { [sequelize_1.Op.in]: studentIds } },
                group: ['userId'],
                raw: true,
            })
            : [];
        const countMap = new Map(countRows.map((row) => [row.userId, Number(row.count)]));
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
    static async getOverallStatistics(teacherId) {
        const classNamesFromAuth = await this.getClassNames(teacherId);
        const classNamesFromUsers = await models_1.User.findAll({
            where: { role: 'student' },
            attributes: ['className'],
            group: ['className'],
            raw: true,
        });
        const classNames = [...new Set([
                ...classNamesFromAuth,
                ...classNamesFromUsers
                    .map((item) => item.className)
                    .filter(Boolean),
            ])];
        const totalStudents = await models_1.User.count({ where: { role: 'student' } });
        const studentIds = (await models_1.User.findAll({
            where: { role: 'student' },
            attributes: ['id'],
        })).map((user) => user.id);
        const overallStats = {
            totalClasses: classNames.length,
            totalStudents,
            totalApplications: 0,
            statusCount: {},
        };
        if (studentIds.length > 0) {
            const applications = await models_1.Application.findAll({
                where: { userId: { [sequelize_1.Op.in]: studentIds } },
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
    static async getAllApplications(teacherId, filters) {
        const where = {};
        if (filters?.className) {
            where.className = filters.className;
        }
        const authorizedStudents = await models_1.AuthorizedStudent.findAll({
            where,
            attributes: ['name', 'className'],
        });
        const studentNames = authorizedStudents.map((s) => s.name);
        const classNames = [...new Set(authorizedStudents.map((s) => s.className))];
        const studentUsers = await models_1.User.findAll({
            where: {
                name: { [sequelize_1.Op.in]: studentNames },
                className: { [sequelize_1.Op.in]: classNames },
                role: 'student',
            },
            attributes: ['id', 'name', 'className'],
        });
        const studentIds = studentUsers.map((u) => u.id);
        const appWhere = {
            userId: { [sequelize_1.Op.in]: studentIds },
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
                appWhere.applicationDate[sequelize_1.Op.gte] = filters.startDate;
            }
            if (filters.endDate) {
                appWhere.applicationDate[sequelize_1.Op.lte] = filters.endDate;
            }
        }
        const applications = await models_1.Application.findAll({
            where: appWhere,
            include: [
                {
                    model: models_1.User,
                    as: 'user',
                    attributes: ['id', 'name', 'className'],
                },
            ],
            order: [['applicationDate', 'DESC']],
        });
        return applications;
    }
    static async resolveUniqueUsername(name) {
        const baseUsername = (0, pinyin_1.generateUsername)(name);
        for (let attempt = 0; attempt < 5; attempt++) {
            const candidate = attempt === 0
                ? baseUsername
                : `${baseUsername}${Math.floor(Math.random() * 900) + 100}`;
            const existingUser = await models_1.User.findOne({ where: { username: candidate } });
            if (!existingUser) {
                return candidate;
            }
        }
        throw new Error('无法生成唯一用户名，请稍后重试');
    }
    static async getStudentsOverview(_teacherId) {
        const studentUsers = await models_1.User.findAll({
            where: { role: 'student' },
            attributes: ['id', 'name', 'className', 'username', 'plainPassword'],
            order: [['name', 'ASC']],
        });
        if (studentUsers.length === 0) {
            return [];
        }
        const studentIds = studentUsers.map((user) => user.id);
        const applications = await models_1.Application.findAll({
            where: { userId: { [sequelize_1.Op.in]: studentIds } },
            attributes: ['userId', 'status'],
        });
        const statsMap = new Map();
        studentIds.forEach((id) => {
            statsMap.set(id, { totalApplications: 0, statusCount: {} });
        });
        applications.forEach((app) => {
            const stats = statsMap.get(app.userId);
            if (!stats)
                return;
            stats.totalApplications += 1;
            const status = app.status || '未设置';
            stats.statusCount[status] = (stats.statusCount[status] || 0) + 1;
        });
        return studentUsers.map((user) => {
            const stats = statsMap.get(user.id);
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
    static async createStudentAccount(name, major, studentLink) {
        const trimmedName = name.trim();
        const username = await this.resolveUniqueUsername(trimmedName);
        const password = (0, pinyin_1.generatePassword)(trimmedName);
        const className = major?.trim() || DEFAULT_CLASS_NAME;
        const transaction = await database_1.sequelize.transaction();
        try {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await models_1.User.create({
                username,
                password: hashedPassword,
                plainPassword: password,
                name: trimmedName,
                className,
                role: 'student',
            }, { transaction });
            await models_1.AuthorizedStudent.create({
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
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
exports.TeacherService = TeacherService;
exports.default = TeacherService;
//# sourceMappingURL=teacherService.js.map