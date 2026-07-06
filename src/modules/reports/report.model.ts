import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuestionScoreEntry } from '@/types';
import crypto from 'crypto';

export interface IReport extends Document {
  _id: Types.ObjectId;
  practice: Types.ObjectId;
  session: Types.ObjectId;
  user: Types.ObjectId;
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  questionScores: QuestionScoreEntry[];
  tips: string[];
  shareToken: string;
}

const reportSchema = new Schema<IReport>(
  {
    practice: { type: Schema.Types.ObjectId, ref: 'Practice', required: true, index: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    overallScore: { type: Number, required: true, min: 1, max: 10 },
    summary: { type: String, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    questionScores: [
      {
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        score: { type: Number },
        feedback: { type: String },
      },
    ],
    tips: [{ type: String }],
    shareToken: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

reportSchema.pre('save', function () {
  if (!this.shareToken) {
    this.shareToken = crypto.randomUUID();
  }
});

export default mongoose.model<IReport>('Report', reportSchema);
