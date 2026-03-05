import Report, { IReport } from '../models/Report';
import Question from '../models/Question';
import Session from '../models/Session';
import { getAIProvider, EvaluationInput } from './ai';
import { ApiError } from '../utils/apiError';

export async function generateReport(sessionId: string, userId: string): Promise<IReport> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');

  // Check if report already exists
  const existing = await Report.findOne({ session: sessionId });
  if (existing) return existing;

  const questions = await Question.find({ session: sessionId });

  // Build evaluation inputs from questions that have both responses and evaluations
  const evaluations: EvaluationInput[] = questions
    .filter((q) => q.response?.transcript && q.evaluation)
    .map((q) => ({
      questionText: q.text,
      responseTranscript: q.response!.transcript,
      evaluation: q.evaluation!,
    }));

  if (evaluations.length === 0) {
    throw ApiError.badRequest('No evaluated responses to generate a report from');
  }

  const ai = getAIProvider();
  const reportData = await ai.generateReport(evaluations);

  const report = await Report.create({
    session: sessionId,
    user: userId,
    overallScore: reportData.overallScore,
    summary: reportData.summary,
    strengths: reportData.strengths,
    improvements: reportData.improvements,
    tips: reportData.tips,
    questionScores: questions
      .filter((q) => q.evaluation)
      .map((q) => ({
        question: q._id,
        score: q.evaluation!.score,
        feedback: q.evaluation!.feedback,
      })),
  });

  return report;
}

export async function getReportBySession(sessionId: string, userId: string): Promise<IReport> {
  const report = await Report.findOne({ session: sessionId, user: userId }).populate('questionScores.question');
  if (!report) throw ApiError.notFound('Report not found');
  return report;
}

export async function getUserReports(userId: string): Promise<IReport[]> {
  return Report.find({ user: userId }).populate('session', 'title type').sort({ createdAt: -1 });
}
