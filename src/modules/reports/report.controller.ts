import { Request, Response, NextFunction } from 'express';
import * as reportService from '@/modules/reports/report.service';

export const getReportHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getReportBySession(req.params.sessionId as string, req.user!.id);
    res.json({ message: 'Report retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
};

export const generateReportHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.generateReport(req.params.sessionId as string, req.user!.id);
    res.status(201).json({ message: 'Report generated successfully', data: report });
  } catch (error) {
    next(error);
  }
};

export const listReportsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportService.getUserReports(req.user!.id);
    res.json({ message: 'Reports retrieved successfully', data: reports });
  } catch (error) {
    next(error);
  }
};
