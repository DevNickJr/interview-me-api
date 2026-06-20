import { Router } from 'express';
import validateRequest from '@/middlewares/validate-request';
import * as Schema from '@/modules/questions/question.schema';
import * as Controller from '@/modules/questions/question.controller';

const router = Router({ mergeParams: true });

router.post('/', validateRequest([Schema.addQuestionSchema]), Controller.addQuestionHandler);
router.post('/generate', validateRequest([Schema.generateQuestionsSchema]), Controller.generateQuestionsHandler);
router.get('/', Controller.getQuestionsHandler);
router.patch('/:id', validateRequest([Schema.addQuestionSchema]), Controller.updateQuestionHandler);
router.delete('/:id', Controller.deleteQuestionHandler);
router.post('/:id/respond', validateRequest([Schema.respondSchema]), Controller.respondHandler);
router.post('/:id/evaluate', Controller.evaluateHandler);

export default router;
