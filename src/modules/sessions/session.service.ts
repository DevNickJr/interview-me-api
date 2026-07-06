import Session, { ISession } from '@/modules/sessions/session.model';
import Question from '@/modules/questions/question.model';
import CustomError from '@/utils/CustomError';
import { CreateSessionInput, UpdateSessionInput } from './session.schema';

export async function createSession(
  userId: string,
  data: CreateSessionInput
): Promise<ISession> {
  return Session.create({ ...data, user: userId });
}

export async function getUserSessions(userId: string): Promise<ISession[]> {
  return Session.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getSessionById(sessionId: string, userId: string): Promise<ISession> {
  const session = await Session.findOne({ _id: sessionId, user: userId }).populate('questions');
  if (!session) throw CustomError.notFound('Session not found');
  return session;
}

export async function updateSession(
  sessionId: string,
  userId: string,
  data: UpdateSessionInput
): Promise<ISession> {
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, user: userId },
    { $set: data },
    { new: true }
  );
  if (!session) throw CustomError.notFound('Session not found');
  return session;
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  const session = await Session.findOneAndDelete({ _id: sessionId, user: userId });
  if (!session) throw CustomError.notFound('Session not found');
  await Question.deleteMany({ session: sessionId });
  // Also delete practices associated with this session
  const { default: Practice } = await import('@/modules/practices/practice.model');
  await Practice.deleteMany({ session: sessionId });
}
