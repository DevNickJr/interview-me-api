import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3200),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.coerce.number().min(3600),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'groq']),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  CLIENT_URL: z.string().url(),
}).superRefine((data, ctx) => {
  if (data.AI_PROVIDER === 'openai' && !data.OPENAI_API_KEY) {
    ctx.addIssue({
      code: 'custom',
      message: 'OPENAI_API_KEY is required when AI_PROVIDER is openai',
    });
  }
  if (data.AI_PROVIDER === 'groq' && !data.GROQ_API_KEY) {
    ctx.addIssue({
      code: 'custom',
      message: 'GROQ_API_KEY is required when AI_PROVIDER is groq',
    });
  }
  if (data.AI_PROVIDER === 'anthropic' && !data.ANTHROPIC_API_KEY) {
    ctx.addIssue({
      code: 'custom',
      message: 'ANTHROPIC_API_KEY is required when AI_PROVIDER is anthropic',
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
    parsed
  );
  process.exit(1);
}
export const env = parsed.data;

export default env;
