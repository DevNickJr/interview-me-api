import mongoose, { Schema, Document, Types } from 'mongoose';
import { SessionType, Difficulty } from '@/types';

export interface IArchetype extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  type: SessionType;
  details: {
    role?: string;
    company?: string;
    description?: string;
    difficulty?: Difficulty;
  };
  questionPrompt: string;
  questionCount: number;
  isPremium: boolean;
  sortOrder: number;
  isActive: boolean;
}

const archetypeSchema = new Schema<IArchetype>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    type: { type: String, enum: ['interview', 'presentation', 'speech'], required: true },
    details: {
      role: { type: String, trim: true },
      company: { type: String, trim: true },
      description: { type: String, trim: true },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    },
    questionPrompt: { type: String, required: true },
    questionCount: { type: Number, default: 5 },
    isPremium: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IArchetype>('Archetype', archetypeSchema);
