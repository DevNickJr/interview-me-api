import Report, { IReport } from '@/modules/reports/report.model';
import Practice from '@/modules/practices/practice.model';
import User from '@/modules/auth/auth.model';
import { EvaluationInput, ReportData, useChatCompletionModels } from '@/services/ai';
import CustomError from '@/utils/CustomError';

export async function generateReport(practiceId: string, userId: string): Promise<IReport> {
  const practice = await Practice.findOne({ _id: practiceId, user: userId }).populate('responses.question');
  if (!practice) throw CustomError.notFound('Practice not found');
  if (practice.status !== 'completed') throw CustomError.badRequest('Practice must be completed first');

  const existing = await Report.findOne({ practice: practiceId });
  if (existing) return existing;

  const evaluations: EvaluationInput[] = practice.responses
    .filter((r) => r.transcript && r.evaluation)
    .map((r) => ({
      questionText: (r.question as any).text || '',
      responseTranscript: r.transcript,
      evaluation: r.evaluation!,
    }));

  if (evaluations.length === 0) {
    throw CustomError.badRequest('No evaluated responses to generate a report from');
  }

  const reportData = await useChatCompletionModels({
    type: 'generate-report',
    data: evaluations,
  }) as ReportData;

  const report = await Report.create({
    practice: practiceId,
    session: practice.session,
    user: userId,
    overallScore: reportData.overallScore,
    summary: reportData.summary,
    strengths: reportData.strengths,
    improvements: reportData.improvements,
    tips: reportData.tips,
    questionScores: practice.responses
      .filter((r) => r.evaluation)
      .map((r) => ({
        question: r.question,
        score: r.evaluation!.score,
        feedback: r.evaluation!.feedback,
      })),
  });

  return report;
}

export async function getReportByPractice(practiceId: string, userId: string): Promise<IReport> {
  const report = await Report.findOne({ practice: practiceId, user: userId })
    .populate('questionScores.question')
    .populate('session', 'title type');
  if (!report) throw CustomError.notFound('Report not found');
  return report;
}

export async function getUserReports(userId: string): Promise<IReport[]> {
  return Report.find({ user: userId })
    .populate('session', 'title type')
    .populate('practice', 'attemptNumber')
    .sort({ createdAt: -1 });
}

export async function getSharedReport(shareToken: string) {
  const report = await Report.findOne({ shareToken })
    .populate('session', 'title type')
    .populate('user', 'name');
  if (!report) throw CustomError.notFound('Report not found');

  const user = await User.findById(report.user);
  const session = report.session as any;

  return {
    overallScore: report.overallScore,
    summary: report.summary,
    strengths: report.strengths,
    improvements: report.improvements,
    tips: report.tips,
    sessionTitle: session?.title || '',
    sessionType: session?.type || '',
    userName: user?.name?.split(' ')[0] || 'Anonymous',
  };
}
