import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/configs/env.config';
import { AIProvider, QuestionGenerationContext, ResponseEvaluation, ReportData, EvaluationInput } from './types';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private modelName: string;

  constructor(modelName: string) {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    this.modelName = modelName;
  }

  async generateQuestions(context: QuestionGenerationContext): Promise<string[]> {
    const prompt = this.buildQuestionPrompt(context);
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 2048,
      system: 'You are an expert interviewer and public speaking coach. Generate realistic, thoughtful questions. Return ONLY a JSON array of strings, no other text.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];
    return JSON.parse(content.text);
  }

  async evaluateResponse(data: { question: string, response: string}): Promise<ResponseEvaluation> {
    const result = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 1024,
      system: `You are an expert interview coach. Evaluate the candidate's response to the given question.
Return ONLY a JSON object with this exact shape:
{
  "score": <number 1-10>,
  "feedback": "<overall feedback string>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}`,
      messages: [{ role: 'user', content: `Question: "${data.question}"\n\nCandidate's Response: "${data.response}"` }],
    });

    const content = result.content[0];
    if (content.type !== 'text') return { score: 0, feedback: '', strengths: [], improvements: [] };
    return JSON.parse(content.text);
  }

  async generateReport(evaluations: EvaluationInput[]): Promise<ReportData> {
    const evalSummary = evaluations
      .map((e, i) => `Q${i + 1}: "${e.questionText}" — Score: ${e.evaluation.score}/10`)
      .join('\n');

    const result = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 2048,
      system: `You are an expert interview coach generating a final performance report.
Return ONLY a JSON object with this exact shape:
{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence summary>",
  "strengths": ["<strength1>", ...],
  "improvements": ["<improvement1>", ...],
  "tips": ["<actionable tip1>", ...]
}`,
      messages: [
        {
          role: 'user',
          content: `Here are the question-by-question evaluations:\n\n${evalSummary}\n\nDetailed evaluations:\n${JSON.stringify(evaluations, null, 2)}`,
        },
      ],
    });

    const content = result.content[0];
    if (content.type !== 'text') {
      return { overallScore: 0, summary: '', strengths: [], improvements: [], tips: [] };
    }
    return JSON.parse(content.text);
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
