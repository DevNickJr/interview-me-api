import { Request, Response, NextFunction } from 'express';
import * as sessionService from '@/modules/sessions/session.service';

export const createSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.createSession(req.user!.id, req.body);
    res.status(201).json({ message: 'Session created successfully', data: session });
  } catch (error) {
    next(error);
  }
};

export const getSessionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionService.getUserSessions(req.user!.id);
    res.json({ message: 'Sessions retrieved successfully', data: sessions });
  } catch (error) {
    next(error);
  }
};

export const getSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.getSessionById(req.params.id as string, req.user!.id);
    res.json({ message: 'Session retrieved successfully', data: session });
  } catch (error) {
    next(error);
  }
};

export const updateSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.updateSession(req.params.id as string, req.user!.id, req.body);
    res.json({ message: 'Session updated successfully', data: session });
  } catch (error) {
    next(error);
  }
};

export const deleteSessionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sessionService.deleteSession(req.params.id as string, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
