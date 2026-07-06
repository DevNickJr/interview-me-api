import mongoose, { Schema, Document, Types } from 'mongoose';
import { PracticeStatus, PracticeResponseEntry } from '@/types';

export interface IPractice extends Document {
  _id: Types.ObjectId;
  session: Types.ObjectId;
  user: Types.ObjectId;
  attemptNumber: number;
  status: PracticeStatus;
  responses: PracticeResponseEntry[];
  startedAt: Date;
  completedAt?: Date;
}

const practiceSchema = new Schema<IPractice>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    attemptNumber: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    responses: [
      {
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        transcript: { type: String, default: '' },
        audioUrl: { type: String },
        duration: { type: Number, default: 0 },
        evaluation: {
          score: { type: Number },
          feedback: { type: String },
          strengths: [{ type: String }],
          improvements: [{ type: String }],
        },
      },
    ],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPractice>('Practice', practiceSchema);
