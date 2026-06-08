import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import config from '../config';
import { User, AuthorizedStudent } from '../models';

export class AuthService {
  // 用户注册（学生）
  static async registerStudent(
    username: string,
    password: string,
    name: string,
    className: string,
    email?: string,
    phone?: string
  ) {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('用户名已被使用');
    }

    // 验证是否在授权名单中
    const authorizedStudents = await AuthorizedStudent.findAll({
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

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      name,
      className,
      email,
      phone,
      role: 'student',
      teacherId: authorizedStudent.teacherId,
    });

    // 标记授权学生为已使用
    await authorizedStudent.update({
      isUsed: true,
      usedByUserId: user.id,
    });

    // 生成 JWT token
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

  // 用户登录
  static async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
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

  // 生成 JWT token
  private static generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  // 获取当前用户信息
  static async getUserProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'name', 'email', 'phone', 'className', 'role'],
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  // 更新用户信息
  static async updateUserProfile(
    userId: number,
    updates: { name?: string; email?: string; phone?: string }
  ) {
    const user = await User.findByPk(userId);

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

export default AuthService;
