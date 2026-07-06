import { z } from 'zod';

export const createCheckoutSchema = z.object({
  body: z.object({
    plan: z.enum(['basic', 'pro']),
    redirectUrl: z.string().url(),
  }),
});

export const webhookSchema = z.object({
  body: z.record(z.string(), z.any()),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>['body'];
