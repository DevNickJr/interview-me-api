import { z } from 'zod';

export const addQuestionSchema = z.object({
  body: z.object({
    text: z.string().min(1),
  }),
});

export const generateQuestionsSchema = z.object({
  body: z.object({
    count: z.number().int().min(1).max(20).default(5),
  }),
});

export const questionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const sessionIdParamSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1),
  }),
});

export type AddQuestionInput = z.infer<typeof addQuestionSchema>['body'];
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>['body'];
