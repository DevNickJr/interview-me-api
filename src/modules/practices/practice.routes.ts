import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import validateRequest from '@/middlewares/validate-request';
import * as Schema from '@/modules/practices/practice.schema';
import * as Controller from '@/modules/practices/practice.controller';

const router = Router();

router.use(isAuthenticated);

router.post('/start', validateRequest([Schema.startPracticeSchema]), Controller.startPracticeHandler);
router.get('/', validateRequest([Schema.paginationSchema]), Controller.getPracticesHandler);
router.get('/:id', validateRequest([Schema.practiceIdParamSchema]), Controller.getPracticeHandler);
router.get('/session/:sessionId', validateRequest([Schema.sessionIdParamSchema]), Controller.getSessionPracticesHandler);
router.post('/:id/respond/:questionId', validateRequest([Schema.practiceQuestionIdParamSchema, Schema.submitResponseSchema]), Controller.submitResponseHandler);
router.post('/:id/evaluate/:questionId', validateRequest([Schema.practiceQuestionIdParamSchema]), Controller.evaluateResponseHandler);
router.post('/:id/complete', validateRequest([Schema.practiceIdParamSchema]), Controller.completePracticeHandler);

export default router;
