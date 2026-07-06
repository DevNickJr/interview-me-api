import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import * as Controller from '@/modules/reports/report.controller';

const router = Router();

// Public route - shared report (no auth required)
router.get('/share/:shareToken', Controller.getSharedReportHandler);

// Protected routes
router.use(isAuthenticated);

router.get('/practice/:practiceId', Controller.getReportHandler);
router.post('/practice/:practiceId/generate', Controller.generateReportHandler);
router.get('/', Controller.listReportsHandler);

export default router;
