
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

export const ARCHETYPES = {
  // Silicon Valley = Fast-paced, disruptive, casual, risk-tolerant
  startup_disruptor: {
    name: "Fast-Paced Startup / Agile Tech Vibe",
    style: "Casual, direct, energetic, and highly ambitious.",
    focus: "Speed, innovation, challenging status quos, comfort with ambiguity, and learning from fast failure."
  },
  // Microsoft = Structured, matrixed, corporate, scale-focused
  enterprise_corporate: {
    name: "Structured Enterprise / Big Corporate",
    style: "Highly polished, formal, diplomatic, and process-oriented.",
    focus: "Cross-functional alignment, long-term strategy, navigating company politics, scalability, and structural compliance."
  },
  // Nigerian/Emerging Markets = Resilient, gritty, sharp, high-context
  emerging_market_resilience: {
    name: "High-Stakes / Emerging Market Vibe",
    style: "Respectful yet intensely sharp, sharp-witted, and pragmatic.",
    focus: "Exceptional resourcefulness, grit, operational survival, quick pivoting, and handling real-world infrastructure constraints."
  },
  // Bank = High-regulation, conservative, zero-error, legacy
  conservative_institutional: {
    name: "Conservative / Highly Regulated Institutional",
    style: "Ultra-professional, precise, formal, and cautious.",
    focus: "Risk mitigation, strict adherence to protocols, accountability, security, data integrity, and zero tolerance for careless errors."
  }
};

export type ISessionArchetype = keyof typeof ARCHETYPES
export const SESSIONARCHETYPES = Object.keys(ARCHETYPES) as ISessionArchetype[]

export const generateSystemInstruction = (archetypeKey?: ISessionArchetype) => {
  // Default fallback
  const archetype = archetypeKey && ARCHETYPES[archetypeKey]

  const systemInstruction = `
    You are an expert interviewer and public speaking coach. Generate realistic, thoughtful questions

    ${(archetypeKey && archetype) ? 
      `For the feel of the questions, adapt your interviewing persona to match a "${archetype.name}" environment.
    
      COMMUNICATION STYLE:
      - Adopt a tone that is ${archetype.style}
      
      CORE EVALUATION CRITERIA:
      - Apply these cultural traits naturally to the candidate's specific job role or topic -  ${archetype.focus}.`

    : '' }

    OUTPUT FORMAT:
    - Return ONLY a JSON array of strings, no other text
  `.trim();

  return systemInstruction
}


export type { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';
