import { env } from '@/configs/env.config';
import { AIProvider } from './types';
import { OpenAIProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';
import { GroqProvider } from './groq.provider';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  switch (env.AI_PROVIDER) {
    case 'anthropic':
      cachedProvider = new AnthropicProvider();
      break;
    case 'openai':
    default:
      cachedProvider = new OpenAIProvider();
      break;
    case 'groq':
      cachedProvider = new GroqProvider();
      break;
  }

  return cachedProvider;
}

export type { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';
