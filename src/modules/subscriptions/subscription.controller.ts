import { Request, Response, NextFunction } from 'express';
import * as subscriptionService from '@/modules/subscriptions/subscription.service';

export const getUserPlanHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await subscriptionService.getUserPlan(req.user!.id);
    res.json({ message: 'Plan retrieved successfully', data: plan });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.getSubscription(req.user!.id);
    res.json({ message: 'Subscription retrieved successfully', data: subscription });
  } catch (error) {
    next(error);
  }
};

export const createCheckoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan, redirectUrl } = req.body;
    const checkout = await subscriptionService.createCheckout(req.user!.id, plan, redirectUrl);
    res.status(201).json({ message: 'Checkout created successfully', data: checkout });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscriptionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.user!.id);
    res.json({ message: 'Subscription cancelled successfully', data: subscription });
  } catch (error) {
    next(error);
  }
};

export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hash = req.headers['verif-hash'] as string;
    await subscriptionService.handleWebhook(req.body, hash);
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    next(error);
  }
};
