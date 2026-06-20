import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuestionScoreEntry } from '@/types';

export interface IReport extends Document {
  _id: Types.ObjectId;
  session: Types.ObjectId;
  user: Types.ObjectId;
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  questionScores: QuestionScoreEntry[];
  tips: string[];
}

const reportSchema = new Schema<IReport>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', reportSchema);
