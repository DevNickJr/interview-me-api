import { Express, Router } from 'express';
import authRouter from '@/modules/auth/auth.routes';
import sessionRouter from '@/modules/sessions/session.routes';
import reportRouter from '@/modules/reports/report.routes';
import speechRouter from '@/modules/speech/speech.routes';
import practiceRouter from '@/modules/practices/practice.routes';
import subscriptionRouter from '@/modules/subscriptions/subscription.routes';
import archetypeRouter from '@/modules/archetypes/archetype.routes';

export const routes: { path: string; router: Router }[] = [
  { path: 'auth', router: authRouter },
  { path: 'sessions', router: sessionRouter },
  { path: 'reports', router: reportRouter },
  { path: 'speech', router: speechRouter },
  { path: 'practices', router: practiceRouter },
  { path: 'subscriptions', router: subscriptionRouter },
  { path: 'archetypes', router: archetypeRouter },
];

export const initializeRoutes = (app: Express): void => {
  routes.forEach((route) => {
    app.use(`/api/${route.path}`, route.router);
  });
};
