import Question, { IQuestion } from '../models/Question';
import Session from '../models/Session';
import { ApiError } from '../utils/apiError';

export async function addQuestion(
  sessionId: string,
  userId: string,
  data: { text: string; source?: 'manual' | 'ai_generated' }
): Promise<IQuestion> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  if (session.status !== 'draft') throw ApiError.badRequest('Cannot add questions to a started session');

  const count = await Question.countDocuments({ session: sessionId });

  const question = await Question.create({
    session: sessionId,
    text: data.text,
    source: data.source || 'manual',
    order: count + 1,
  });

  session.questions.push(question._id);
  await session.save();

  return question;
}

export async function addBulkQuestions(
  sessionId: string,
  userId: string,
  questions: string[]
): Promise<IQuestion[]> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  if (session.status !== 'draft') throw ApiError.badRequest('Cannot add questions to a started session');

  const currentCount = await Question.countDocuments({ session: sessionId });

  const docs = questions.map((text, i) => ({
    session: sessionId,
    text,
    source: 'ai_generated' as const,
    order: currentCount + i + 1,
  }));

  const created = await Question.insertMany(docs);
  session.questions.push(...created.map((q) => q._id));
  await session.save();

  return created as unknown as IQuestion[];
}

export async function getSessionQuestions(
  sessionId: string,
  userId: string
): Promise<IQuestion[]> {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  return Question.find({ session: sessionId }).sort({ order: 1 });
}

export async function updateQuestion(
  questionId: string,
  userId: string,
  data: { text?: string }
): Promise<IQuestion> {
  const question = await Question.findById(questionId).populate('session');
  if (!question) throw ApiError.notFound('Question not found');

  const session = await Session.findOne({ _id: question.session, user: userId });
  if (!session) throw ApiError.notFound('Session not found');

  if (data.text) question.text = data.text;
  await question.save();
  return question;
}

export async function deleteQuestion(questionId: string, userId: string): Promise<void> {
  const question = await Question.findById(questionId);
  if (!question) throw ApiError.notFound('Question not found');

  const session = await Session.findOne({ _id: question.session, user: userId });
  if (!session) throw ApiError.notFound('Session not found');

  session.questions = session.questions.filter((q) => !q.equals(question._id));
  await session.save();
  await question.deleteOne();
}

export async function submitResponse(
  questionId: string,
  userId: string,
  data: { transcript: string; audioUrl?: string; duration: number }
): Promise<IQuestion> {
  const question = await Question.findById(questionId);
  if (!question) throw ApiError.notFound('Question not found');

  const session = await Session.findOne({ _id: question.session, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  if (session.status !== 'in_progress') throw ApiError.badRequest('Session is not in progress');

  question.response = data;
  await question.save();
  return question;
}
