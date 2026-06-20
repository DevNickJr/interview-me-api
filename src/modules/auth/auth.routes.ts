import { Router } from 'express';
import passport from 'passport';
import validateRequest from '@/middlewares/validate-request';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import * as Schema from '@/modules/auth/auth.schema';
import * as Controller from '@/modules/auth/auth.controller';

const router = Router();

router.post(
  '/register',
  validateRequest([Schema.registerSchema]),
  Controller.registerHandler
);

router.post(
  '/login',
  validateRequest([Schema.loginSchema]),
  Controller.loginHandler
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  Controller.googleCallbackHandler
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  Controller.githubCallbackHandler
);

router.get('/me', isAuthenticated, Controller.getMeHandler);

export default router;
