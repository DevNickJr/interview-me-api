import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuestionSource } from '@/types';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  session: Types.ObjectId;
  text: string;
  source: QuestionSource;
  order: number;
}

const questionSchema = new Schema<IQuestion>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    text: { type: String, required: true, trim: true },
    source: { type: String, enum: ['manual', 'ai_generated'], default: 'manual' },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', questionSchema);
