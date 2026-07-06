import mongoose, { Schema, Document, Types } from 'mongoose';
import { SubscriptionStatus } from '@/types';

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  plan: 'basic' | 'pro';
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  flutterwaveSubscriptionId?: string;
  flutterwaveCustomerId?: string;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['basic', 'pro'], required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    flutterwaveSubscriptionId: { type: String },
    flutterwaveCustomerId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
