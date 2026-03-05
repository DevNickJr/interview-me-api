export interface QuestionGenerationContext {
  type: 'interview' | 'presentation' | 'speech';
  role?: string;
  company?: string;
  description?: string;
  difficulty?: string;
  count: number;
}

export interface ResponseEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ReportData {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

export interface EvaluationInput {
  questionText: string;
  responseTranscript: string;
  evaluation: ResponseEvaluation;
}

export interface AIProvider {
  generateQuestions(context: QuestionGenerationContext): Promise<string[]>;
  evaluateResponse(question: string, response: string): Promise<ResponseEvaluation>;
  generateReport(evaluations: EvaluationInput[]): Promise<ReportData>;
}
