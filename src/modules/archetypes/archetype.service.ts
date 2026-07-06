import mongoose from 'mongoose';
import Archetype, { IArchetype } from '@/modules/archetypes/archetype.model';
import { ISession } from '@/modules/sessions/session.model';
import * as sessionService from '@/modules/sessions/session.service';
import * as questionService from '@/modules/questions/question.service';
import { useChatCompletionModels } from '@/services/ai';
import CustomError from '@/utils/CustomError';

export async function getArchetypes(): Promise<IArchetype[]> {
  return Archetype.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
}

export async function getArchetype(idOrSlug: string): Promise<IArchetype> {
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

  const archetype = await Archetype.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
  );

  if (!archetype) throw CustomError.notFound('Archetype not found');

  return archetype;
}

export async function createSessionFromArchetype(
  userId: string,
  archetypeId: string
): Promise<ISession> {
  const archetype = await getArchetype(archetypeId);

  if (archetype.isPremium) {
    const { getUserPlan } = await import('@/modules/subscriptions/subscription.service');
    const plan = await getUserPlan(userId);

    if (!plan.premiumArchetypes) {
      throw CustomError.badRequest('Upgrade your plan to access premium archetypes');
    }
  }

  const session = await sessionService.createSession(userId, {
    title: archetype.name,
    type: archetype.type,
    details: archetype.details,
  });

  const description = [archetype.details.description, archetype.questionPrompt]
    .filter(Boolean)
    .join('. ');

  const questions = (await useChatCompletionModels({
    type: 'generate-question',
    data: {
      type: archetype.type,
      role: archetype.details.role,
      company: archetype.details.company,
      description,
      difficulty: archetype.details.difficulty,
      count: archetype.questionCount,
    },
  })) as string[];

  await questionService.addBulkQuestions(session._id.toString(), userId, questions);

  return session;
}

export async function seedArchetypes(): Promise<void> {
  const defaults = [
    {
      name: 'Behavioral Interview',
      slug: 'behavioral',
      type: 'interview' as const,
      icon: 'brain',
      description: 'Practice common behavioral questions using the STAR method',
      details: { difficulty: 'medium' as const, description: 'Common behavioral questions using STAR method' },
      questionPrompt:
        'Generate behavioral interview questions that require STAR method responses. Focus on leadership, teamwork, conflict resolution, and problem-solving scenarios.',
      questionCount: 5,
      isPremium: false,
      sortOrder: 1,
    },
    {
      name: 'Technical - Software Engineer',
      slug: 'tech-swe',
      type: 'interview' as const,
      icon: 'code',
      description: 'Practice system design and technical concepts',
      details: { role: 'Software Engineer', difficulty: 'hard' as const },
      questionPrompt:
        'Generate technical interview questions covering system design, data structures, algorithms concepts, and software engineering best practices.',
      questionCount: 5,
      isPremium: false,
      sortOrder: 2,
    },
    {
      name: 'Product Manager',
      slug: 'product-manager',
      type: 'interview' as const,
      icon: 'briefcase',
      description: 'Practice product sense, metrics, and prioritization',
      details: { role: 'Product Manager', difficulty: 'medium' as const },
      questionPrompt:
        'Generate product management interview questions covering product sense, metrics definition, feature prioritization, and go-to-market strategy.',
      questionCount: 5,
      isPremium: true,
      sortOrder: 3,
    },
    {
      name: 'MBA Admissions',
      slug: 'mba-admissions',
      type: 'interview' as const,
      icon: 'graduation-cap',
      description: 'Prepare for MBA program interviews',
      details: { difficulty: 'hard' as const, description: 'MBA program interview preparation' },
      questionPrompt:
        'Generate MBA admissions interview questions about leadership experience, career goals, why MBA, teamwork, and ethical dilemmas.',
      questionCount: 5,
      isPremium: true,
      sortOrder: 4,
    },
    {
      name: 'Medical School',
      slug: 'medical-school',
      type: 'interview' as const,
      icon: 'stethoscope',
      description: 'Practice medical school MMI and panel interviews',
      details: { difficulty: 'hard' as const },
      questionPrompt:
        'Generate medical school interview questions covering ethical scenarios, motivation for medicine, patient care philosophy, and teamwork in healthcare.',
      questionCount: 5,
      isPremium: true,
      sortOrder: 5,
    },
    {
      name: 'Scholarship Interview',
      slug: 'scholarship',
      type: 'interview' as const,
      icon: 'award',
      description: 'Prepare for scholarship and fellowship interviews',
      details: { difficulty: 'medium' as const },
      questionPrompt:
        'Generate scholarship interview questions about academic achievements, community impact, leadership, research interests, and future goals.',
      questionCount: 5,
      isPremium: false,
      sortOrder: 6,
    },
    {
      name: 'Public Speaking',
      slug: 'public-speaking',
      type: 'speech' as const,
      icon: 'mic',
      description: 'Practice speech delivery and presentation skills',
      details: { difficulty: 'easy' as const },
      questionPrompt:
        'Generate impromptu speech prompts and public speaking topics covering persuasion, storytelling, informative speaking, and debate.',
      questionCount: 5,
      isPremium: false,
      sortOrder: 7,
    },
    {
      name: 'Case Study',
      slug: 'case-study',
      type: 'interview' as const,
      icon: 'bar-chart',
      description: 'Practice consulting-style case study interviews',
      details: { role: 'Consultant', difficulty: 'hard' as const },
      questionPrompt:
        'Generate case study interview questions covering market sizing, profitability analysis, market entry strategy, and business framework application.',
      questionCount: 5,
      isPremium: true,
      sortOrder: 8,
    },
  ];

  const operations = defaults.map((archetype) => ({
    updateOne: {
      filter: { slug: archetype.slug },
      update: { $set: archetype },
      upsert: true,
    },
  }));

  await Archetype.bulkWrite(operations);
}
