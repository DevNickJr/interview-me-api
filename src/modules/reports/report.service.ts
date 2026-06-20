import Report, { IReport } from '@/modules/reports/report.model';
import Question from '@/modules/questions/question.model';
import Session from '@/modules/sessions/session.model';
import { getAIProvider, EvaluationInput } from '@/services/ai';
import CustomError from '@/utils/CustomError';

export async function generateReport(sessionId: string, userId: string): Promise<IReport> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw CustomError.notFound('Session not found');

  const existing = await Report.findOne({ session: sessionId });
  if (existing) return existing;

  const questions = await Question.find({ session: sessionId });

  const evaluations: EvaluationInput[] = questions
    .filter((q) => q.response?.transcript && q.evaluation)
    .map((q) => ({
      questionText: q.text,
      responseTranscript: q.response!.transcript,
      evaluation: q.evaluation!,
    }));

  if (evaluations.length === 0) {
    throw CustomError.badRequest('No evaluated responses to generate a report from');
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
  if (!report) throw CustomError.notFound('Report not found');
  return report;
}

export async function getUserReports(userId: string): Promise<IReport[]> {
  return Report.find({ user: userId }).populate('session', 'title type').sort({ createdAt: -1 });
}
