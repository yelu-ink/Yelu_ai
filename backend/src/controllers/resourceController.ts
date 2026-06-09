import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import ResourceService from '../services/resourceService';
import config from '../config';

const resourceUploadDir = path.join(config.upload.dir, 'resources');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(resourceUploadDir)) {
      fs.mkdirSync(resourceUploadDir, { recursive: true });
    }
    cb(null, resourceUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
});

export class ResourceController {
  static getUploadMiddleware() {
    return upload.single('file');
  }

  static async listForStudent(req: AuthRequest, res: Response) {
    try {
      const data = await ResourceService.getResourcesForStudent(req.user!.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取资料失败',
      });
    }
  }

  static async listForTeacher(req: AuthRequest, res: Response) {
    try {
      const data = await ResourceService.getResourcesForTeacher(req.user!.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '获取资料失败',
      });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { title, category, description, contentType, linkUrl, priority } = req.body;

      if (!contentType || !['file', 'link'].includes(contentType)) {
        return res.status(400).json({
          success: false,
          message: '请选择有效的内容类型',
        });
      }

      const data = await ResourceService.createResource(req.user!.id, {
        title,
        category,
        description,
        contentType,
        linkUrl,
        priority: priority ? Number(priority) : undefined,
        file: req.file,
      });

      res.status(201).json({
        success: true,
        message: '资料创建成功',
        data,
      });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: error.message || '创建资料失败',
      });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const resourceId = parseInt(req.params.id, 10);
      if (Number.isNaN(resourceId)) {
        return res.status(400).json({
          success: false,
          message: '无效的资料 ID',
        });
      }

      const { title, category, description, contentType, linkUrl, priority } = req.body;

      if (!contentType || !['file', 'link'].includes(contentType)) {
        return res.status(400).json({
          success: false,
          message: '请选择有效的内容类型',
        });
      }

      const data = await ResourceService.updateResource(req.user!.id, resourceId, {
        title,
        category,
        description,
        contentType,
        linkUrl,
        priority: priority ? Number(priority) : undefined,
        file: req.file,
      });

      res.json({
        success: true,
        message: '资料更新成功',
        data,
      });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        success: false,
        message: error.message || '更新资料失败',
      });
    }
  }

  static async remove(req: AuthRequest, res: Response) {
    try {
      const resourceId = parseInt(req.params.id, 10);
      if (Number.isNaN(resourceId)) {
        return res.status(400).json({
          success: false,
          message: '无效的资料 ID',
        });
      }

      await ResourceService.deleteResource(req.user!.id, resourceId);

      res.json({
        success: true,
        message: '资料已删除',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || '删除资料失败',
      });
    }
  }
}

export default ResourceController;
