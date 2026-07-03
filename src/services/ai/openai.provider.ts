import OpenAI from 'openai';
import { env } from '@/configs/env.config';
import { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private modelName: string;

  constructor(modelName: string) {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.modelName = modelName;
  }

  async generateQuestions(context: QuestionGenerationContext): Promise<string[]> {
    const prompt = this.buildQuestionPrompt(context);
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        { role: 'system', content: 'You are an expert interviewer and public speaking coach. Generate realistic, thoughtful questions. Return ONLY a JSON array of strings, no other text.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content || '[]';
    return JSON.parse(content);
  }

  async evaluateResponse(data: { question: string, response: string }): Promise<ResponseEvaluation> {
    const result = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Evaluate the candidate's response to the given question.
Return ONLY a JSON object with this exact shape:
{
  "score": <number 1-10>,
  "feedback": "<overall feedback string>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}`,
        },
        { role: 'user', content: `Question: "${data.question}"\n\nCandidate's Response: "${data.response}"` },
      ],
      temperature: 0.5,
    });

    const content = result.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  async generateReport(evaluations: EvaluationInput[]): Promise<ReportData> {
    const evalSummary = evaluations
      .map((e, i) => `Q${i + 1}: "${e.questionText}" — Score: ${e.evaluation.score}/10`)
      .join('\n');

    const result = await this.client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach generating a final performance report.
Return ONLY a JSON object with this exact shape:
{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence summary>",
  "strengths": ["<strength1>", ...],
  "improvements": ["<improvement1>", ...],
  "tips": ["<actionable tip1>", ...]
}`,
        },
        {
          role: 'user',
          content: `Here are the question-by-question evaluations:\n\n${evalSummary}\n\nDetailed evaluations:\n${JSON.stringify(evaluations, null, 2)}`,
        },
      ],
      temperature: 0.5,
    });

    const content = result.choices[0]?.message?.content || '{}';
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
