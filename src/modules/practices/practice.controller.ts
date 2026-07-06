import { Request, Response, NextFunction } from 'express';
import * as practiceService from '@/modules/practices/practice.service';

export const startPracticeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const practice = await practiceService.startPractice(req.user!.id, req.body.sessionId);
    res.status(201).json({ message: 'Practice started successfully', data: practice });
  } catch (error) {
    next(error);
  }
};

export const getPracticesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await practiceService.getUserPractices(req.user!.id, page, limit);
    res.json({ message: 'Practices retrieved successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getPracticeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const practice = await practiceService.getPractice(req.user!.id, req.params.id as string);
    res.json({ message: 'Practice retrieved successfully', data: practice });
  } catch (error) {
    next(error);
  }
};

export const getSessionPracticesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const practices = await practiceService.getSessionPractices(
      req.user!.id,
      req.params.sessionId as string
    );
    res.json({ message: 'Session practices retrieved successfully', data: practices });
  } catch (error) {
    next(error);
  }
};

export const submitResponseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const practice = await practiceService.submitResponse(
      req.user!.id,
      req.params.id as string,
      req.params.questionId as string,
      req.body
    );
    res.json({ message: 'Response submitted successfully', data: practice });
  } catch (error) {
    next(error);
  }
};

export const evaluateResponseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const practice = await practiceService.evaluateResponse(
      req.user!.id,
      req.params.id as string,
      req.params.questionId as string
    );
    res.json({ message: 'Response evaluated successfully', data: practice });
  } catch (error) {
    next(error);
  }
};

export const completePracticeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const practice = await practiceService.completePractice(req.user!.id, req.params.id as string);
    res.json({ message: 'Practice completed successfully', data: practice });
  } catch (error) {
    next(error);
  }
};
