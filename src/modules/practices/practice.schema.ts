import { z } from 'zod';

export const startPracticeSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1),
  }),
});

export const submitResponseSchema = z.object({
  body: z.object({
    transcript: z.string().default('No response'),
    audioUrl: z.string().optional(),
    duration: z.number().min(0).default(0),
  }),
});

export const practiceIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const practiceQuestionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    questionId: z.string().min(1),
  }),
});

export const sessionIdParamSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type StartPracticeInput = z.infer<typeof startPracticeSchema>['body'];
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>['body'];
