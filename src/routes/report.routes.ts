import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import * as reportService from '../services/report.service';

const router = Router();

function paramStr(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

router.use(requireAuth);

// Get report for a session
router.get('/session/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getReportBySession(paramStr(req.params.sessionId), req.user!.id);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Generate report
router.post('/session/:sessionId/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.generateReport(paramStr(req.params.sessionId), req.user!.id);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

// List all user reports
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportService.getUserReports(req.user!.id);
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

export default router;
