import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';
import { ApiError } from '../utils/apiError';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = header.split(' ')[1];
    const { userId } = verifyToken(token);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : ApiError.unauthorized());
  }
}
