import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ApplicationService from '../services/applicationService';

export class ApplicationController {
  // 创建投递记录
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        company,
        position,
        applicationDate,
        channel,
        type,
        status,
        statusDate,
        location,
        referralCode,
        priority,
        remarks,
      } = req.body;

      // 验证必填字段
      if (!company || !position || !applicationDate) {
        return res.status(400).json({
          success: false,
          message: '请填写必填字段（公司、岗位、投递时间）',
        });
      }

      const application = await ApplicationService.createApplication(userId, {
        company,
        position,
        applicationDate,
        channel,
        type,
        status,
        statusDate,
        location,
        referralCode,
        priority,
        remarks,
      });

      res.status(201).json({
        success: true,
        message: '创建成功',
        data: application,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '创建失败',
      });
    }
  }

  // 获取投递记录列表
  static async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const filters = req.query as any;

      const applications = await ApplicationService.getUserApplications(userId, filters);

      res.json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取列表失败',
      });
    }
  }

  // 获取单个投递记录
  static async get(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);

      const application = await ApplicationService.getApplicationById(id, userId);

      res.json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || '获取记录失败',
      });
    }
  }

  // 更新投递记录
  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      const updates = req.body;

      const application = await ApplicationService.updateApplication(id, userId, updates);

      res.json({
        success: true,
        message: '更新成功',
        data: application,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '更新失败',
      });
    }
  }

  // 删除投递记录
  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);

      await ApplicationService.deleteApplication(id, userId);

      res.json({
        success: true,
        message: '删除成功',
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || '删除失败',
      });
    }
  }

  // 获取投递量排名
  static async ranking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = await ApplicationService.getApplicationRanking(userId);

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取投递量排名失败',
      });
    }
  }

  // 获取统计数据
  static async statistics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await ApplicationService.getStatistics(userId);

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
}

export default ApplicationController;
