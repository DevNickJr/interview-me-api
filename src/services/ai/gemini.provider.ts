import {GoogleGenAI} from '@google/genai';
import { env } from '@/configs/env.config';
import { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';
import { generateSystemInstruction } from '.';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(modelName: string) {
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.modelName = modelName;
  }

  async generateQuestions(context: QuestionGenerationContext): Promise<string[]> {
    const prompt = this.buildQuestionPrompt(context);

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction: generateSystemInstruction(context.archetype),
      }
    });

    const content = response.text;
    console.log({
      content
    })
    if (!response.text) return [];
    return JSON.parse(content || '');
  }

  async evaluateResponse(data: { question: string, response: string }): Promise<ResponseEvaluation> {
     const result = await this.client.models.generateContent({
      model: this.modelName,
      contents: `Question: "${data.question}"\n\nCandidate's Response: "${data.response}"`,
      config: {
        systemInstruction: `You are an expert interview coach. Evaluate the candidate's response to the given question.
          Return ONLY a JSON object with this exact shape:
          {
            "score": <number 1-10>,
            "feedback": "<overall feedback string>",
            "strengths": ["<strength1>", "<strength2>"],
            "improvements": ["<improvement1>", "<improvement2>"]
          }`,
      }
    });

    const content = result.text;
    console.log({
      content
    })
    if (!content) return { score: 0, feedback: '', strengths: [], improvements: [] };;
    return JSON.parse(content || '');
  }

  async generateReport(evaluations: EvaluationInput[]): Promise<ReportData> {
    const evalSummary = evaluations
      .map((e, i) => `Q${i + 1}: "${e.questionText}" — Score: ${e.evaluation.score}/10`)
      .join('\n');

    const result = await this.client.models.generateContent({
      model: this.modelName,
      contents: `Here are the question-by-question evaluations:\n\n${evalSummary}\n\nDetailed evaluations:\n${JSON.stringify(evaluations, null, 2)}`,
      config: {
        systemInstruction: `You are an expert interview coach generating a final performance report.
Return ONLY a JSON object with this exact shape:
{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence summary>",
  "strengths": ["<strength1>", ...],
  "improvements": ["<improvement1>", ...],
  "tips": ["<actionable tip1>", ...]
}`,
      }
    });

    const content = result.text;
    if (!content) {
      return { overallScore: 0, summary: '', strengths: [], improvements: [], tips: [] };
    }
    return JSON.parse(content);
  }

  private buildQuestionPrompt(context: QuestionGenerationContext): string {
    const parts = [`Generate ${context.count} ${context.type} questions.`];
    if (context.role) parts.push(`Role: ${context.role}`);
    if (context.company) parts.push(`Company: ${context.company}`);
    if (context.description) parts.push(`Context: ${context.description}`);
    if (context.difficulty) parts.push(`Difficulty: ${context.difficulty}`);
    return parts.join('\n');
  }
}
