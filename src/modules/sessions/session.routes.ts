import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import validateRequest from '@/middlewares/validate-request';
import * as Schema from '@/modules/sessions/session.schema';
import * as Controller from '@/modules/sessions/session.controller';
import questionRoutes from '@/modules/questions/question.routes';

const router = Router();

router.use(isAuthenticated);

router.post('/', validateRequest([Schema.createSessionSchema]), Controller.createSessionHandler);
router.get('/', Controller.getSessionsHandler);
router.get('/:id', Controller.getSessionHandler);
router.patch('/:id', validateRequest([Schema.updateSessionSchema]), Controller.updateSessionHandler);
router.delete('/:id', Controller.deleteSessionHandler);
router.post('/:id/start', Controller.startSessionHandler);
router.post('/:id/complete', Controller.completeSessionHandler);

// Mount question routes under sessions
router.use('/:sessionId/questions', questionRoutes);

export default router;
