import mongoose, { Schema, Document, Types } from 'mongoose';
import { SessionType, Difficulty, QuestionOrder, SessionStatus, SessionDetails } from '../types';

export interface ISession extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  type: SessionType;
  details: SessionDetails;
  questions: Types.ObjectId[];
  questionOrder: QuestionOrder;
  status: SessionStatus;
  startedAt?: Date;
  completedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['interview', 'presentation', 'speech'], required: true },
    details: {
      role: { type: String, trim: true },
      company: { type: String, trim: true },
      description: { type: String, trim: true },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    questionOrder: { type: String, enum: ['sequential', 'random'], default: 'sequential' },
    status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', sessionSchema);
