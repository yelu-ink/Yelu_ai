import { Router } from 'express';
import ResourceController from '../controllers/resourceController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('student'), ResourceController.listForStudent);

router.get(
  '/teacher',
  requireRole('teacher'),
  ResourceController.listForTeacher
);

router.post(
  '/teacher',
  requireRole('teacher'),
  ResourceController.getUploadMiddleware(),
  ResourceController.create
);

router.put(
  '/teacher/:id',
  requireRole('teacher'),
  ResourceController.getUploadMiddleware(),
  ResourceController.update
);

router.delete(
  '/teacher/:id',
  requireRole('teacher'),
  ResourceController.remove
);

export default router;
