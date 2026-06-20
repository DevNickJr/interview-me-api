import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { registerUser, loginUser } from '@/modules/auth/auth.service';
import { signToken } from '@/utils/jwt';
import { env } from '@/configs/env.config';
import { IUser } from '@/modules/auth/auth.model';

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const loginHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: Error | null, user: IUser | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      const result = loginUser(user);
      res.json({ message: 'Login successful', data: result });
    }
  )(req, res, next);
};

export const googleCallbackHandler = (req: Request, res: Response) => {
  const user = req.user as unknown as IUser;
  const token = signToken(user._id.toString());
  res.redirect(`${env.CLIENT_URL}/auth/callback?token=${token}`);
};

export const githubCallbackHandler = (req: Request, res: Response) => {
  const user = req.user as unknown as IUser;
  const token = signToken(user._id.toString());
  res.redirect(`${env.CLIENT_URL}/auth/callback?token=${token}`);
};

export const getMeHandler = (req: Request, res: Response) => {
  res.json({ message: 'User retrieved successfully', data: { user: req.user } });
};
