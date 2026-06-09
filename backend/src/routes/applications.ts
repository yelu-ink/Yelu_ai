import { Router } from 'express';
import ApplicationController from '../controllers/applicationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 学生专属路由
router.use(requireRole('student'));

router.post('/', ApplicationController.create);
router.get('/', ApplicationController.list);
router.get('/statistics', ApplicationController.statistics);
router.get('/ranking', ApplicationController.ranking);
router.get('/recommendations', ApplicationController.recommendations);
router.get('/application-warnings/pending', ApplicationController.getPendingWarning);
router.post('/application-warnings/:id/read', ApplicationController.markWarningRead);
router.get('/:id', ApplicationController.get);
router.put('/:id', ApplicationController.update);
router.delete('/:id', ApplicationController.delete);

export default router;
