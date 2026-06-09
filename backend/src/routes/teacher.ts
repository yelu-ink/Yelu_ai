import { Router } from 'express';
import TeacherController from '../controllers/teacherController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证且为老师角色
router.use(authenticate);
router.use(requireRole('teacher'));

// 导入学生名单
router.post('/import-students', TeacherController.importStudents);

// 获取学生名单
router.get('/students', TeacherController.getStudents);

// 获取学生概览（名单 + 投递统计）
router.get('/students/overview', TeacherController.getStudentsOverview);

// 创建学生账号
router.post('/create-student', TeacherController.createStudentAccount);

// 更新/删除学生账号
router.get('/students/:id/statistics', TeacherController.getStudentStatistics);
router.post('/students/:id/application-warning', TeacherController.sendApplicationWarning);
router.put('/students/:id', TeacherController.updateStudentAccount);
router.delete('/students/:id', TeacherController.deleteStudentAccount);

// 获取班级列表
router.get('/classes', TeacherController.getClasses);

// 获取班级统计
router.get('/statistics/class/:className', TeacherController.getClassStatistics);

// 获取总体统计
router.get('/statistics/overall', TeacherController.getOverallStatistics);

// 获取所有投递记录
router.get('/applications', TeacherController.getAllApplications);

// 导出投递记录
router.get('/applications/export', TeacherController.exportApplications);

export default router;
