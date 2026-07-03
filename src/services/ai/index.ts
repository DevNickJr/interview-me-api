
import OpenAI from "openai";
import env from "@/configs/env.config";
import { getCurrentModel, getCurrentProvider, getTotalAvailableConfigurations, Provider, PROVIDERS, recordFailure, recordSuccess } from "./rotation";
import { AIProvider, EvaluationInput, QuestionGenerationContext } from "./types";
import { GeminiProvider } from "./gemini.provider";
import { AnthropicProvider } from "./anthropic.provider";
import { OpenAIProvider } from "./openai.provider";
import { GroqProvider } from "./groq.provider";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  content: string;
  model: string;
  totalTokens: number;
}

function getProviderConfig(name: typeof PROVIDERS[number]) {
  switch (name) {
    case "groq":
      return {
        apiKey: env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      };

    case "gemini":
      return {
        apiKey: env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      };

    case "openai":
      return {
        apiKey: env.OPENAI_API_KEY,
        baseURL: "https://api.openai.com/v1",
      };
    case "anthropic":
      return {
        apiKey: env.ANTHROPIC_API_KEY,
        baseURL: "https://anthropic.com",
      };
    default:
      return {
        apiKey: env.OPENAI_API_KEY,
        baseURL: "https://api.openai.com/v1",
      };
  }
}

const systemMessages = {
  'generate-questions': 'You are an expert interviewer and public speaking coach. Generate realistic, thoughtful questions. Return ONLY a JSON array of strings, no other text.',
  'generate-report': `You are an expert interview coach. Evaluate the candidate's response to the given question.
      Return ONLY a JSON object with this exact shape:
      {
        "score": <number 1-10>,
        "feedback": "<overall feedback string>",
        "strengths": ["<strength1>", "<strength2>"],
        "improvements": ["<improvement1>", "<improvement2>"]
      },
      `,
  'evaluate-responses': `You are an expert interview coach generating a final performance report.
      Return ONLY a JSON object with this exact shape:
      {
        "overallScore": <number 1-10>,
        "summary": "<2-3 sentence summary>",
        "strengths": ["<strength1>", ...],
        "improvements": ["<improvement1>", ...],
        "tips": ["<actionable tip1>", ...]
      }`,

}

export async function useChatCompletionModels({
  attemptCount = 0,
  type,
  data
}: {
  attemptCount?: number;
  type: 'generate-question' | 'evaluate-response' | 'generate-report';
  data: QuestionGenerationContext | { question: string, response: string } | EvaluationInput[]
}) {
  const providerName = getCurrentProvider();
  const modelName = getCurrentModel();
  const providerInfo = getProviderConfig(providerName);

  const maxConfigAttempts = getTotalAvailableConfigurations();

  // Safeguard against infinite loops if every single model across all providers is rate-limited
  if (attemptCount >= maxConfigAttempts) {
   console.error("All tiers and providers are entirely rate-limited.");
    // TODO: Add a time to next call  
    throw new Error("Service temporarily unavailable due to upstream rate limits.");
  }
  
  try {
    if (!providerInfo.apiKey) {
      throw new Error(
        `API key not configured for provider: ${providerName}`
      );
    }

    recordSuccess();

    const provider = getAIProvider(providerName, modelName);

    switch (type) {
      case 'generate-question':
        return await provider.generateQuestions(data as QuestionGenerationContext)
      case 'evaluate-response':
        return await provider.evaluateResponse(data as { question: string, response: string })
      case 'generate-report':
        return await provider.generateReport(data as EvaluationInput[])
    }

  } catch (error: any) {
    console.log({ error })
    recordFailure();
    return useChatCompletionModels({ attemptCount: attemptCount+1, data, type });
  }
}


export function getAIProvider(provider: Provider, modelName: string): AIProvider {
  let cachedProvider: AIProvider | null = null;

  switch (provider) {
    case 'anthropic':
      cachedProvider = new AnthropicProvider(modelName);
      break;
    case 'openai':
      cachedProvider = new OpenAIProvider(modelName);
      break;
    case 'groq':
      cachedProvider = new GroqProvider(modelName);
      break;
    case 'gemini':
      cachedProvider = new GeminiProvider(modelName);
      break;
    default:
      cachedProvider = new OpenAIProvider(modelName);
      break;
    }
    return cachedProvider;
}

export type { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';
