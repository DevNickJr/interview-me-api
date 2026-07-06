import { Types } from 'mongoose';

export type SessionType = 'interview' | 'presentation' | 'speech';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionSource = 'manual' | 'ai_generated';
export type QuestionOrder = 'sequential' | 'random';
export type PracticeStatus = 'in_progress' | 'completed';
export type AuthProvider = 'local' | 'google' | 'github';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface SessionDetails {
  role?: string;
  company?: string;
  description?: string;
  difficulty?: Difficulty;
}

export interface QuestionEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface PracticeResponseEntry {
  question: Types.ObjectId;
  transcript: string;
  audioUrl?: string;
  duration: number;
  evaluation?: QuestionEvaluation;
}

export interface QuestionScoreEntry {
  question: Types.ObjectId;
  score: number;
  feedback: string;
}

// Express request augmentation
declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      id: string;
      email: string;
      name: string;
    }
  }
}
