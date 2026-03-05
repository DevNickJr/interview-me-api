import { env } from '../../config/env';
import { AIProvider } from './types';
import { OpenAIProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  switch (env.aiProvider) {
    case 'anthropic':
      cachedProvider = new AnthropicProvider();
      break;
    case 'openai':
    default:
      cachedProvider = new OpenAIProvider();
      break;
  }

  return cachedProvider;
}

export type { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';
