import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuestionSource, QuestionResponse, QuestionEvaluation } from '../types';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  session: Types.ObjectId;
  text: string;
  source: QuestionSource;
  order: number;
  response?: QuestionResponse;
  evaluation?: QuestionEvaluation;
}

const questionSchema = new Schema<IQuestion>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    text: { type: String, required: true, trim: true },
    source: { type: String, enum: ['manual', 'ai_generated'], default: 'manual' },
    order: { type: Number, required: true },
    response: {
      transcript: { type: String },
      audioUrl: { type: String },
      duration: { type: Number },
    },
    evaluation: {
      score: { type: Number },
      feedback: { type: String },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', questionSchema);
