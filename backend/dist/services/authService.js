"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const models_1 = require("../models");
class AuthService {
    static async registerStudent(username, password, name, className, email, phone) {
        const existingUser = await models_1.User.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('用户名已被使用');
        }
        const authorizedStudents = await models_1.AuthorizedStudent.findAll({
            where: {
                name,
                className,
                isUsed: false,
            },
        });
        if (authorizedStudents.length === 0) {
            throw new Error('该学生不在授权名单中，或已被注册');
        }
        if (authorizedStudents.length > 1) {
            throw new Error('存在多个匹配授权记录，请联系老师确认注册信息');
        }
        const authorizedStudent = authorizedStudents[0];
        if (!authorizedStudent.teacherId) {
            throw new Error('授权记录缺少归属老师，请联系老师处理');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await models_1.User.create({
            username,
            password: hashedPassword,
            name,
            className,
            email,
            phone,
            role: 'student',
            teacherId: authorizedStudent.teacherId,
        });
        await authorizedStudent.update({
            isUsed: true,
            usedByUserId: user.id,
        });
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                className: user.className,
                role: user.role,
            },
            token,
        };
    }
    static async login(username, password) {
        const user = await models_1.User.findOne({ where: { username } });
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('用户名或密码错误');
        }
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                className: user.className,
                role: user.role,
            },
            token,
        };
    }
    static generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, {
            expiresIn: config_1.default.jwt.expiresIn,
        });
    }
    static async getUserProfile(userId) {
        const user = await models_1.User.findByPk(userId, {
            attributes: ['id', 'username', 'name', 'email', 'phone', 'className', 'role'],
        });
        if (!user) {
            throw new Error('用户不存在');
        }
        return user;
    }
    static async updateUserProfile(userId, updates) {
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        if (user.role === 'student') {
            throw new Error('学生不可修改个人信息');
        }
        const trimmedName = updates.name?.trim();
        if (!trimmedName) {
            throw new Error('请填写姓名');
        }
        await user.update({ name: trimmedName });
        return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            phone: user.phone,
            className: user.className,
            role: user.role,
        };
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
//# sourceMappingURL=authService.js.map