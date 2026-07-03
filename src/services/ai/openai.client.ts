import OpenAI from "openai";
import env from "@/configs/env.config";
import { getCurrentModel, getCurrentProvider, getTotalAvailableConfigurations, PROVIDERS, recordFailure, recordSuccess } from "./rotation";
import { QuestionGenerationContext } from "./types";

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

export async function chatCompletion({
  messages,
  attemptCount = 0,
  completionType
}: {
  messages: ChatMessage[];
  attemptCount: number;
  completionType: 'generate-report' | 'generate-questions' | 'evaluate-responses'
}): Promise<ChatCompletionResponse> {
  const providerName = getCurrentProvider();
  const modelName = getCurrentModel();
  const provider = getProviderConfig(providerName);
  const maxConfigAttempts = getTotalAvailableConfigurations();

  // Safeguard against infinite loops if every single model across all providers is rate-limited
  if (attemptCount >= maxConfigAttempts) {
   console.error("All tiers and providers are entirely rate-limited.");
    // TODO: Add a time to next call  
    throw new Error("Service temporarily unavailable due to upstream rate limits.");
  }
  
  try {
    if (!provider.apiKey) {
      throw new Error(
        `API key not configured for provider: ${providerName}`
      );
    }
  
    const client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
    });
  
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'system', content: systemMessages[completionType] }, ...messages],
      temperature: 0.7,
      max_tokens: 4000,
    });
  
    console.info(
      `LLM response: provider=${providerName}, model=${response.model}, tokens=${response.usage?.total_tokens ?? 0}`
    );
  
    recordSuccess();

    const content = response.choices?.[0]?.message?.content;
    console.log({
      content
    })

    return {
      content: 'content',
      model: response.model,
      totalTokens: response.usage?.total_tokens || 0,
    };
  } catch (error: any) {
    recordFailure();
    
    // 2. Identify if the error is a Rate Limit (429) or Quota/Auth issue (403/401)
    const statusCode = error?.status || error?.statusCode;
    const isRateLimitOrQuota = statusCode === 429 || statusCode === 403 || statusCode === 401;
    const isMissingKey = error?.message?.includes("API key not configured");

    if (isRateLimitOrQuota || isMissingKey) {
      console.warn(
        `Provider execution failed [Status: ${statusCode || 'Local Config Error'}]. Attempting fallback... Failed Provider: ${providerName}`
      );

      // 3. Fallback Mechanism:
      // Assuming your `recordFailure()` updates the state so that the NEXT call to `getCurrentProvider()` 
      // returns a different provider, we recursively invoke the function again.
      return chatCompletion({ messages, attemptCount: attemptCount+1, completionType: completionType });
    }

    // 4. Critical Developer Error: If it's a structural error (e.g., bad payload syntax 400), don't mask it; throw immediately.
    console.error(`Critical non-rate-limit error encountered on provider ${providerName}:`, error);
    throw error;
  }

}



  //   const content = response.content[0];
  //   if (content.type !== 'text') return [];
  //   return JSON.parse(content.text);
  // }

const buildQuestionPrompt = (context: QuestionGenerationContext): string => {
  const parts = [`Generate ${context.count} ${context.type} questions.`];
  if (context.role) parts.push(`Role: ${context.role}`);
  if (context.company) parts.push(`Company: ${context.company}`);
  if (context.description) parts.push(`Context: ${context.description}`);
  if (context.difficulty) parts.push(`Difficulty: ${context.difficulty}`);
  return parts.join('\n');
}