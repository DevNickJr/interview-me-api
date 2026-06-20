import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import User from '@/modules/auth/auth.model';
import CustomError from '@/utils/CustomError';

export async function isAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw CustomError.unauthorized('No token provided');
    }

    const token = header.split(' ')[1];
    const { userId } = verifyToken(token);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw CustomError.unauthorized('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof CustomError ? error : CustomError.unauthorized());
  }
}
