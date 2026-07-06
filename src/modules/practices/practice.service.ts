import Practice, { IPractice } from '@/modules/practices/practice.model';
import Session from '@/modules/sessions/session.model';
import Question from '@/modules/questions/question.model';
import { ResponseEvaluation, useChatCompletionModels } from '@/services/ai';
import CustomError from '@/utils/CustomError';

export async function startPractice(userId: string, sessionId: string): Promise<IPractice> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw CustomError.notFound('Session not found');
  if (session.questions.length === 0) throw CustomError.badRequest('Session has no questions');

  // Lazy import to avoid circular dependencies
  const { getUserPlan } = await import('@/modules/subscriptions/subscription.service');
  const planConfig = await getUserPlan(userId);

  // Check monthly session limit (count distinct sessions practiced this month)
  if (planConfig.sessionsPerMonth !== -1) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const distinctSessions = await Practice.distinct('session', {
      user: userId,
      createdAt: { $gte: startOfMonth },
    });

    if (distinctSessions.length >= planConfig.sessionsPerMonth) {
      // Only count as new if this session hasn't been practiced this month
      if (!distinctSessions.some((s) => s.toString() === sessionId)) {
        throw CustomError.forbidden(
          `Monthly session limit reached (${planConfig.sessionsPerMonth} sessions). Upgrade your plan for more.`
        );
      }
    }
  }

  // Check retry limit for this session
  const existingCount = await Practice.countDocuments({ session: sessionId, user: userId });
  if (planConfig.retriesPerSession !== -1 && existingCount >= planConfig.retriesPerSession) {
    throw CustomError.forbidden(
      `Retry limit reached for this session (${planConfig.retriesPerSession} attempts). Upgrade your plan for more.`
    );
  }

  const practice = await Practice.create({
    session: sessionId,
    user: userId,
    attemptNumber: existingCount + 1,
  });

  return practice;
}

export async function getPractice(userId: string, practiceId: string): Promise<IPractice> {
  const practice = await Practice.findOne({ _id: practiceId, user: userId })
    .populate('session')
    .populate('responses.question');
  if (!practice) throw CustomError.notFound('Practice not found');
  return practice;
}

export async function getSessionPractices(userId: string, sessionId: string): Promise<IPractice[]> {
  return Practice.find({ session: sessionId, user: userId }).sort({ attemptNumber: 1 });
}

export async function getUserPractices(
  userId: string,
  page: number,
  limit: number
): Promise<{ practices: IPractice[]; total: number; page: number; limit: number }> {
  const skip = (page - 1) * limit;
  const [practices, total] = await Promise.all([
    Practice.find({ user: userId })
      .populate('session', 'title type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Practice.countDocuments({ user: userId }),
  ]);

  return { practices, total, page, limit };
}

export async function submitResponse(
  userId: string,
  practiceId: string,
  questionId: string,
  data: { transcript: string; audioUrl?: string; duration: number }
): Promise<IPractice> {
  const practice = await Practice.findOne({ _id: practiceId, user: userId });
  if (!practice) throw CustomError.notFound('Practice not found');
  if (practice.status !== 'in_progress') throw CustomError.badRequest('Practice is not in progress');

  const existingIndex = practice.responses.findIndex(
    (r) => r.question.toString() === questionId
  );

  if (existingIndex !== -1) {
    practice.responses[existingIndex].transcript = data.transcript;
    practice.responses[existingIndex].duration = data.duration;
    if (data.audioUrl) practice.responses[existingIndex].audioUrl = data.audioUrl;
  } else {
    practice.responses.push({
      question: questionId as any,
      transcript: data.transcript,
      audioUrl: data.audioUrl,
      duration: data.duration,
    });
  }

  await practice.save();
  return practice;
}

export async function evaluateResponse(
  userId: string,
  practiceId: string,
  questionId: string
): Promise<IPractice> {
  const practice = await Practice.findOne({ _id: practiceId, user: userId });
  if (!practice) throw CustomError.notFound('Practice not found');

  const responseEntry = practice.responses.find(
    (r) => r.question.toString() === questionId
  );
  if (!responseEntry) throw CustomError.notFound('Response not found for this question');

  const question = await Question.findById(questionId);
  if (!question) throw CustomError.notFound('Question not found');

  let evaluation: ResponseEvaluation = {
    score: 0,
    feedback: 'No response to evaluate',
    strengths: [],
    improvements: [],
  };

  if (responseEntry.transcript) {
    evaluation = (await useChatCompletionModels({
      type: 'evaluate-response',
      data: {
        question: question.text,
        response: responseEntry.transcript,
      },
    })) as ResponseEvaluation;
  }

  responseEntry.evaluation = evaluation;
  await practice.save();

  return practice;
}

export async function completePractice(userId: string, practiceId: string): Promise<IPractice> {
  const practice = await Practice.findOne({ _id: practiceId, user: userId });
  if (!practice) throw CustomError.notFound('Practice not found');
  if (practice.status !== 'in_progress') throw CustomError.badRequest('Practice is not in progress');

  practice.status = 'completed';
  practice.completedAt = new Date();
  await practice.save();

  return practice;
}
