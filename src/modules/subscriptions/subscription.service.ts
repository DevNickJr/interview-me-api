import crypto from 'crypto';
import Subscription, { ISubscription } from '@/modules/subscriptions/subscription.model';
import { PLANS, PlanConfig } from '@/configs/plans.config';
import CustomError from '@/utils/CustomError';

export async function getUserPlan(userId: string): Promise<PlanConfig> {
  const subscription = await Subscription.findOne({ user: userId, status: 'active' });

  if (!subscription) return PLANS.free;

  return PLANS[subscription.plan];
}

export async function getSubscription(userId: string): Promise<ISubscription | null> {
  return Subscription.findOne({ user: userId });
}

export async function createCheckout(
  _userId: string,
  _plan: 'basic' | 'pro',
  redirectUrl: string
): Promise<{ checkoutUrl: string; txRef: string }> {
  const txRef = `sub_${crypto.randomUUID()}`;

  // TODO: Integrate with Flutterwave Standard payment
  // 1. Create a payment link via Flutterwave API
  // 2. Pass txRef, plan amount from PLANS[_plan].price, redirectUrl, and user details
  // 3. Return the actual Flutterwave checkout URL

  const checkoutUrl = `https://checkout.flutterwave.com/pay/${txRef}?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return { checkoutUrl, txRef };
}

export async function handleWebhook(payload: any, _hash: string): Promise<void> {
  // TODO: Verify webhook signature from Flutterwave
  // const secretHash = env.FLUTTERWAVE_HASH_SECRET;
  // if (hash !== secretHash) throw CustomError.unauthorized('Invalid webhook signature');

  const { status, tx_ref, customer } = payload;

  if (status !== 'successful') return;

  // Extract plan from tx_ref or payload meta
  // TODO: Parse actual plan from Flutterwave payload metadata
  const plan = (payload.meta?.plan as 'basic' | 'pro') || 'basic';

  const userId = payload.meta?.userId;
  if (!userId) return;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  await Subscription.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      plan,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      flutterwaveSubscriptionId: tx_ref,
      flutterwaveCustomerId: customer?.id,
    },
    { upsert: true, new: true }
  );
}

export async function cancelSubscription(userId: string): Promise<ISubscription> {
  const subscription = await Subscription.findOne({ user: userId, status: 'active' });
  if (!subscription) throw CustomError.notFound('No active subscription found');

  subscription.status = 'cancelled';
  await subscription.save();

  return subscription;
}
