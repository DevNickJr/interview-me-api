import { Express, Router } from 'express';
import authRouter from '@/modules/auth/auth.routes';
import sessionRouter from '@/modules/sessions/session.routes';
import reportRouter from '@/modules/reports/report.routes';
import speechRouter from '@/modules/speech/speech.routes';

export const routes: { path: string; router: Router }[] = [
  { path: 'auth', router: authRouter },
  { path: 'sessions', router: sessionRouter },
  { path: 'reports', router: reportRouter },
  { path: 'speech', router: speechRouter },
];

export const initializeRoutes = (app: Express): void => {
  routes.forEach((route) => {
    app.use(`/api/${route.path}`, route.router);
  });
};
