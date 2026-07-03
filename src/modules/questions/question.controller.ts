import { Request, Response, NextFunction } from 'express';
import * as questionService from '@/modules/questions/question.service';
import Session from '@/modules/sessions/session.model';
import Question from '@/modules/questions/question.model';
import { ResponseEvaluation, useChatCompletionModels } from '@/services/ai';
import CustomError from '@/utils/CustomError';

export const addQuestionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.addQuestion(req.params.sessionId as string, req.user!.id, req.body);
    res.status(201).json({ message: 'Question added successfully', data: question });
  } catch (error) {
    next(error);
  }
};

export const generateQuestionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await Session.findOne({ _id: sessionId, user: req.user!.id });
    if (!session) throw CustomError.notFound('Session not found');

    const generatedTexts = await useChatCompletionModels({
      type: 'generate-question',
      data: {
        type: session.type,
        role: session.details.role,
        company: session.details.company,
        description: session.details.description,
        difficulty: session.details.difficulty,
        count: req.body.count,
      }
    }) as string[];
    
    // const generatedTexts = await ai.generateQuestions({
  
    // });

    const questions = await questionService.addBulkQuestions(sessionId, req.user!.id, generatedTexts);
    res.status(201).json({ message: 'Questions generated successfully', data: questions });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await questionService.getSessionQuestions(req.params.sessionId as string, req.user!.id);
    res.json({ message: 'Questions retrieved successfully', data: questions });
  } catch (error) {
    next(error);
  }
};

export const updateQuestionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.updateQuestion(req.params.id as string, req.user!.id, req.body);
    res.json({ message: 'Question updated successfully', data: question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questionService.deleteQuestion(req.params.id as string, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const respondHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await questionService.submitResponse(req.params.id as string, req.user!.id, req.body);
    res.json({ message: 'Response submitted successfully', data: question });
  } catch (error) {
    next(error);
  }
};

export const evaluateHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = req.params.id as string;
    const question = await Question.findById(questionId);
    if (!question) throw CustomError.notFound('Question not found');
    // if (!question.response?.transcript) throw CustomError.badRequest('No response to evaluate');
    let evaluation: ResponseEvaluation = {
      score: 0,
      feedback: 'No response to evaluate',
      strengths: [],
      improvements: [],
    }
    if (question.response?.transcript) {
      evaluation = await useChatCompletionModels({
        type: "evaluate-response",
        data: {
          question: question.text,
          response: question.response.transcript
        }
      }) as ResponseEvaluation;
    };
    question.evaluation = evaluation;
    await question.save();

    res.json({ message: 'Response evaluated successfully', data: question });
  } catch (error) {
    next(error);
  }
};
