import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import validateRequest from '@/middlewares/validate-request';
import * as Schema from '@/modules/subscriptions/subscription.schema';
import * as Controller from '@/modules/subscriptions/subscription.controller';

const router = Router();

// Webhook does not require authentication
router.post('/webhook', validateRequest([Schema.webhookSchema]), Controller.webhookHandler);

// All remaining routes require authentication
router.use(isAuthenticated);

router.get('/plan', Controller.getUserPlanHandler);
router.get('/current', Controller.getSubscriptionHandler);
router.post('/checkout', validateRequest([Schema.createCheckoutSchema]), Controller.createCheckoutHandler);
router.post('/cancel', Controller.cancelSubscriptionHandler);

export default router;
