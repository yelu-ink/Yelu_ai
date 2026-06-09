import fs from 'fs';
import path from 'path';
import { User, RecruitmentResource } from '../models';
import config from '../config';

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.txt',
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
]);

export class ResourceService {
  static validateFileExtension(filename: string) {
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error('不支持的文件类型，仅支持 pdf、Word、txt、图片');
    }
  }

  static getResourceFileAbsolutePath(relativePath?: string | null) {
    if (!relativePath) return null;
    return path.join(config.upload.dir, relativePath);
  }

  static deleteResourceFile(relativePath?: string | null) {
    const absolutePath = this.getResourceFileAbsolutePath(relativePath);
    if (absolutePath && fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  static serializeResource(resource: RecruitmentResource) {
    return {
      id: resource.id,
      teacherId: resource.teacherId,
      title: resource.title,
      category: resource.category,
      description: resource.description,
      contentType: resource.contentType,
      filePath: resource.filePath,
      fileName: resource.fileName,
      linkUrl: resource.linkUrl,
      priority: resource.priority,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }

  static async getResourcesForStudent(studentUserId: number) {
    const student = await User.findOne({
      where: { id: studentUserId, role: 'student' },
      attributes: ['id', 'teacherId'],
    });

    if (!student?.teacherId) {
      return [];
    }

    const resources = await RecruitmentResource.findAll({
      where: { teacherId: student.teacherId },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    });

    return resources.map((item) => this.serializeResource(item));
  }

  static async getResourcesForTeacher(teacherId: number) {
    const resources = await RecruitmentResource.findAll({
      where: { teacherId },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    });

    return resources.map((item) => this.serializeResource(item));
  }

  static async assertResourceOwnedByTeacher(teacherId: number, resourceId: number) {
    const resource = await RecruitmentResource.findOne({
      where: { id: resourceId, teacherId },
    });

    if (!resource) {
      throw new Error('资料不存在或无权操作');
    }

    return resource;
  }

  static async createResource(
    teacherId: number,
    data: {
      title: string;
      category: string;
      description?: string;
      contentType: 'file' | 'link';
      linkUrl?: string;
      priority?: number;
      file?: Express.Multer.File;
    }
  ) {
    const title = data.title.trim();
    const category = data.category.trim();

    if (!title) throw new Error('请填写资料标题');
    if (!category) throw new Error('请填写资料分类');

    let filePath: string | undefined;
    let fileName: string | undefined;
    let linkUrl: string | undefined;

    if (data.contentType === 'file') {
      if (!data.file) throw new Error('请上传资料文件');
      this.validateFileExtension(data.file.originalname);
      filePath = path.join('resources', data.file.filename).replace(/\\/g, '/');
      fileName = data.file.originalname;
    } else {
      linkUrl = data.linkUrl?.trim();
      if (!linkUrl) throw new Error('请填写链接地址');
    }

    const resource = await RecruitmentResource.create({
      teacherId,
      title,
      category,
      description: data.description?.trim() || undefined,
      contentType: data.contentType,
      filePath,
      fileName,
      linkUrl,
      priority: data.priority ?? 3,
    });

    return this.serializeResource(resource);
  }

  static async updateResource(
    teacherId: number,
    resourceId: number,
    data: {
      title: string;
      category: string;
      description?: string;
      contentType: 'file' | 'link';
      linkUrl?: string;
      priority?: number;
      file?: Express.Multer.File;
    }
  ) {
    const resource = await this.assertResourceOwnedByTeacher(teacherId, resourceId);

    const title = data.title.trim();
    const category = data.category.trim();

    if (!title) throw new Error('请填写资料标题');
    if (!category) throw new Error('请填写资料分类');

    const updates: {
      title: string;
      category: string;
      description?: string;
      contentType: 'file' | 'link';
      priority: number;
      filePath?: string;
      fileName?: string;
      linkUrl?: string;
    } = {
      title,
      category,
      description: data.description?.trim() || undefined,
      contentType: data.contentType,
      priority: data.priority ?? resource.priority,
    };

    if (data.contentType === 'file') {
      if (data.file) {
        this.validateFileExtension(data.file.originalname);
        this.deleteResourceFile(resource.filePath);
        updates.filePath = path.join('resources', data.file.filename).replace(/\\/g, '/');
        updates.fileName = data.file.originalname;
        updates.linkUrl = undefined;
      } else if (resource.contentType !== 'file') {
        throw new Error('请上传资料文件');
      }
    } else {
      const linkUrl = data.linkUrl?.trim();
      if (!linkUrl) throw new Error('请填写链接地址');
      if (resource.contentType === 'file' && resource.filePath) {
        this.deleteResourceFile(resource.filePath);
      }
      updates.linkUrl = linkUrl;
      updates.filePath = undefined;
      updates.fileName = undefined;
    }

    await resource.update(updates);
    return this.serializeResource(resource);
  }

  static async deleteResource(teacherId: number, resourceId: number) {
    const resource = await this.assertResourceOwnedByTeacher(teacherId, resourceId);
    this.deleteResourceFile(resource.filePath);
    await resource.destroy();
    return true;
  }
}

export default ResourceService;
