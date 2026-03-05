import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as questionService from '../services/question.service';
import { getAIProvider } from '../services/ai';
import Session from '../models/Session';
import Question from '../models/Question';
import { ApiError } from '../utils/apiError';

const router = Router({ mergeParams: true });

const addQuestionSchema = z.object({
  text: z.string().min(1),
});

const generateQuestionsSchema = z.object({
  count: z.number().int().min(1).max(20).default(5),
});

const respondSchema = z.object({
  transcript: z.string().min(1),
  audioUrl: z.string().optional(),
  duration: z.number().min(0),
});

function paramStr(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

router.use(requireAuth);

// Add manual question
router.post('/', validate(addQuestionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.addQuestion(paramStr(req.params.sessionId), req.user!.id, req.body);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
});

// Generate questions with AI
router.post('/generate', validate(generateQuestionsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = paramStr(req.params.sessionId);
    const session = await Session.findOne({ _id: sessionId, user: req.user!.id });
    if (!session) throw ApiError.notFound('Session not found');

    const ai = getAIProvider();
    const generatedTexts = await ai.generateQuestions({
      type: session.type,
      role: session.details.role,
      company: session.details.company,
      description: session.details.description,
      difficulty: session.details.difficulty,
      count: req.body.count,
    });

    const questions = await questionService.addBulkQuestions(sessionId, req.user!.id, generatedTexts);
    res.status(201).json(questions);
  } catch (error) {
    next(error);
  }
});

// List questions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await questionService.getSessionQuestions(paramStr(req.params.sessionId), req.user!.id);
    res.json(questions);
  } catch (error) {
    next(error);
  }
});

// Update question
router.patch('/:id', validate(addQuestionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.updateQuestion(paramStr(req.params.id), req.user!.id, req.body);
    res.json(question);
  } catch (error) {
    next(error);
  }
});

// Delete question
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questionService.deleteQuestion(paramStr(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Submit response to a question
router.post('/:id/respond', validate(respondSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.submitResponse(paramStr(req.params.id), req.user!.id, req.body);
    res.json(question);
  } catch (error) {
    next(error);
  }
});

// Evaluate a response with AI
router.post('/:id/evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = paramStr(req.params.id);
    const question = await Question.findById(questionId);
    if (!question) throw ApiError.notFound('Question not found');
    if (!question.response?.transcript) throw ApiError.badRequest('No response to evaluate');

    const ai = getAIProvider();
    const evaluation = await ai.evaluateResponse(question.text, question.response.transcript);

    question.evaluation = evaluation;
    await question.save();

    res.json(question);
  } catch (error) {
    next(error);
  }
});

export default router;
