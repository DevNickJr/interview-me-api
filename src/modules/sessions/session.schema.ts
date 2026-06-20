import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
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
  }),
});

export const updateSessionSchema = z.object({
  body: z.object({
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
  }),
});

export const sessionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>['body'];
