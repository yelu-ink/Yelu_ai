import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import TeacherService from '../services/teacherService';
import config from '../config';

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.upload.dir;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const extname = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(extname)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 CSV 和 Excel 文件'));
    }
  },
});

export class TeacherController {
  // 获取上传中间件
  static getUploadMiddleware() {
    return upload.single('file');
  }

  // 导入学生名单
  static async importStudents(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件',
        });
      }

      // 解析上传的文件
      const XLSX = await import('xlsx');
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<any>(worksheet);

      // 验证数据格式
      const students: Array<{ name: string; className: string }> = [];
      for (const row of data) {
        if (row.name && row.className) {
          students.push({
            name: row.name,
            className: row.className,
          });
        }
      }

      if (students.length === 0) {
        return res.status(400).json({
          success: false,
          message: '文件中没有有效的学生数据',
        });
      }

      const result = await TeacherService.importAuthorizedStudents(students, teacherId);

      // 删除上传的文件
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: `成功导入 ${result.length} 条学生记录`,
        data: {
          count: result.length,
        },
      });
    } catch (error: any) {
      console.error('导入失败:', error);
      res.status(400).json({
        success: false,
        message: error.message || '导入失败',
      });
    }
  }

  // 获取学生概览（名单 + 投递统计）
  static async getStudentsOverview(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;
      const students = await TeacherService.getStudentsOverview(teacherId);

      res.json({
        success: true,
        data: students,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取学生概览失败',
      });
    }
  }

  // 获取学生名单
  static async getStudents(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { className } = req.query;

      const students = await TeacherService.getManagedStudents(teacherId, className as string);

      res.json({
        success: true,
        data: students,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取学生名单失败',
      });
    }
  }

  // 获取班级列表
  static async getClasses(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;

      const classNames = await TeacherService.getClassNames(teacherId);

      res.json({
        success: true,
        data: classNames,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取班级列表失败',
      });
    }
  }

  // 获取班级统计
  static async getClassStatistics(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { className } = req.params;

      const stats = await TeacherService.getClassStatistics(className, teacherId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取统计数据失败',
      });
    }
  }

  // 获取总体统计
  static async getOverallStatistics(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;

      const stats = await TeacherService.getOverallStatistics(teacherId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取统计数据失败',
      });
    }
  }

  // 获取所有投递记录
  static async getAllApplications(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;
      const filters = req.query as any;

      const applications = await TeacherService.getAllApplications(teacherId, filters);

      res.json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取投递记录失败',
      });
    }
  }

  // 导出投递记录为 Excel
  static async exportApplications(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user!.id;
      const filters = req.query as any;

      const applications = await TeacherService.getAllApplications(teacherId, filters);

      // 准备导出数据
      const exportData = applications.map((app: any) => ({
        学生姓名: app.user?.name,
        班级: app.user?.className,
        投递公司: app.company,
        投递岗位: app.position,
        投递时间: app.applicationDate,
        投递渠道: app.channel,
        类型: app.type,
        进展: app.status,
        进展时间: app.statusDate,
        地点: app.location,
        内推码: app.referralCode,
        重视度: app.priority,
        备注: app.remarks,
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '投递记录');

      // 生成文件名
      const fileName = `投递记录导出_${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '导出失败',
      });
    }
  }

  // 创建学生账号
  static async createStudentAccount(req: AuthRequest, res: Response) {
    try {
      const { name, major, studentLink } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: '请填写学生姓名',
        });
      }

      const result = await TeacherService.createStudentAccount(
        req.user!.id,
        name,
        major,
        studentLink
      );

      res.json({
        success: true,
        message: '学生账号创建成功',
        data: {
          ...result,
          name: name.trim(),
          major: result.className,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '创建学生账号失败',
      });
    }
  }

  // 更新学生账号
  static async updateStudentAccount(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (Number.isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的学生 ID',
        });
      }

      const { name, username, password, className, studentLink } = req.body;

      if (!name || !username || !password) {
        return res.status(400).json({
          success: false,
          message: '请填写姓名、账号和密码',
        });
      }

      const result = await TeacherService.updateStudentAccount(req.user!.id, userId, {
        name,
        username,
        password,
        className,
        studentLink,
      });

      res.json({
        success: true,
        message: '学生信息更新成功',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '更新学生信息失败',
      });
    }
  }

  // 删除学生账号
  static async deleteStudentAccount(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (Number.isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的学生 ID',
        });
      }

      await TeacherService.deleteStudentAccount(req.user!.id, userId);

      res.json({
        success: true,
        message: '学生已删除',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '删除学生失败',
      });
    }
  }
}

export default TeacherController;
