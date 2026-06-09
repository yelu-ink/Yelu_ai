import { ApplicationWarning } from '../models';
import ApplicationService from './applicationService';
import TeacherService from './teacherService';

export class ApplicationWarningService {
  static async sendWarning(teacherId: number, studentId: number) {
    await TeacherService.assertStudentOwnedByTeacher(teacherId, studentId);

    const existing = await ApplicationWarning.findOne({
      where: { studentId, isRead: false },
      order: [['createdAt', 'DESC']],
    });

    if (existing) {
      await existing.update({ createdAt: new Date(), teacherId });
      return existing;
    }

    return ApplicationWarning.create({
      studentId,
      teacherId,
      isRead: false,
    });
  }

  static async getPendingWarning(studentId: number) {
    const warning = await ApplicationWarning.findOne({
      where: { studentId, isRead: false },
      order: [['createdAt', 'DESC']],
    });

    if (!warning) {
      return null;
    }

    const recentCount = await ApplicationService.countRecentApplications(studentId, 30);

    return {
      id: warning.id,
      recentCount,
    };
  }

  static async markAsRead(warningId: number, studentId: number) {
    const warning = await ApplicationWarning.findOne({
      where: { id: warningId, studentId },
    });

    if (!warning) {
      throw new Error('预警记录不存在');
    }

    if (warning.isRead) {
      return warning;
    }

    await warning.update({
      isRead: true,
      readAt: new Date(),
    });

    return warning;
  }
}

export default ApplicationWarningService;
