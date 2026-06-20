import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import * as Controller from '@/modules/reports/report.controller';

const router = Router();

router.use(isAuthenticated);

router.get('/session/:sessionId', Controller.getReportHandler);
router.post('/session/:sessionId/generate', Controller.generateReportHandler);
router.get('/', Controller.listReportsHandler);

export default router;
