import mongoose, { Schema, Document, Types } from 'mongoose';
import { SessionType, QuestionOrder, SessionDetails } from '@/types';
import { ISessionArchetype, SESSIONARCHETYPES } from '@/services/ai';

export interface ISession extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  type: SessionType;
  archetype?: ISessionArchetype;
  details: SessionDetails;
  questions: Types.ObjectId[];
  questionOrder: QuestionOrder;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['interview', 'presentation', 'speech'], required: true },
    archetype: { type: String, enum: SESSIONARCHETYPES },
    details: {
      role: { type: String, trim: true },
      company: { type: String, trim: true },
      description: { type: String, trim: true },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    questionOrder: { type: String, enum: ['sequential', 'random'], default: 'sequential' },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', sessionSchema);
