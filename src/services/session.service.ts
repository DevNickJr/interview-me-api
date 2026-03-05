import Session, { ISession } from '../models/Session';
import Question from '../models/Question';
import { ApiError } from '../utils/apiError';
import { SessionDetails, SessionType, QuestionOrder } from '../types';

export async function createSession(
  userId: string,
  data: { title: string; type: SessionType; details?: SessionDetails; questionOrder?: QuestionOrder }
): Promise<ISession> {
  return Session.create({ ...data, user: userId });
}

export async function getUserSessions(userId: string): Promise<ISession[]> {
  return Session.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getSessionById(sessionId: string, userId: string): Promise<ISession> {
  const session = await Session.findOne({ _id: sessionId, user: userId }).populate('questions');
  if (!session) throw ApiError.notFound('Session not found');
  return session;
}

export async function updateSession(
  sessionId: string,
  userId: string,
  data: Partial<{ title: string; type: SessionType; details: SessionDetails; questionOrder: QuestionOrder }>
): Promise<ISession> {
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, user: userId, status: 'draft' },
    { $set: data },
    { new: true }
  );
  if (!session) throw ApiError.notFound('Session not found or already started');
  return session;
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  const session = await Session.findOneAndDelete({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  await Question.deleteMany({ session: sessionId });
}

export async function startSession(sessionId: string, userId: string): Promise<ISession> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  if (session.status !== 'draft') throw ApiError.badRequest('Session already started');
  if (session.questions.length === 0) throw ApiError.badRequest('Add questions before starting');

  session.status = 'in_progress';
  session.startedAt = new Date();
  await session.save();
  return session;
}

export async function completeSession(sessionId: string, userId: string): Promise<ISession> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  if (session.status !== 'in_progress') throw ApiError.badRequest('Session is not in progress');

  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();
  return session;
}
