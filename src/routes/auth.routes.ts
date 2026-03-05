import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { registerUser, loginUser } from '../services/auth.service';
import { signToken } from '../utils/jwt';
import { env } from '../config/env';
import { IUser } from '../models/User';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post('/login', validate(loginSchema), (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: Error | null, user: IUser | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Invalid credentials' });
      }
      const result = loginUser(user);
      res.json(result);
    }
  )(req, res, next);
});

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as unknown as IUser;
    const token = signToken(user._id.toString());
    res.redirect(`${env.clientUrl}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as unknown as IUser;
    const token = signToken(user._id.toString());
    res.redirect(`${env.clientUrl}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
