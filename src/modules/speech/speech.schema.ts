import { z } from 'zod';

export const ttsSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(5000),
    voice: z.string().optional(),
    speed: z.number().min(0.5).max(2.0).optional(),
  }),
});

export type TTSInput = z.infer<typeof ttsSchema>['body'];
