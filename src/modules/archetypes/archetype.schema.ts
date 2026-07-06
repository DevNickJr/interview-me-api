import { z } from 'zod';

export const archetypeIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const createSessionFromArchetypeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
