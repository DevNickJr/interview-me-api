import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as sessionService from '../services/session.service';

const router = Router();

const createSessionSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['interview', 'presentation', 'speech']),
  details: z
    .object({
      role: z.string().optional(),
      company: z.string().optional(),
      description: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    })
    .optional(),
  questionOrder: z.enum(['sequential', 'random']).optional(),
});

const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['interview', 'presentation', 'speech']).optional(),
  details: z
    .object({
      role: z.string().optional(),
      company: z.string().optional(),
      description: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    })
    .optional(),
  questionOrder: z.enum(['sequential', 'random']).optional(),
});

function paramStr(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

router.use(requireAuth);

router.post('/', validate(createSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.createSession(req.user!.id, req.body);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionService.getUserSessions(req.user!.id);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.getSessionById(paramStr(req.params.id), req.user!.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', validate(updateSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.updateSession(paramStr(req.params.id), req.user!.id, req.body);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sessionService.deleteSession(paramStr(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.startSession(paramStr(req.params.id), req.user!.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.completeSession(paramStr(req.params.id), req.user!.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
