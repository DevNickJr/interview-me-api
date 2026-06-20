import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/configs/env.config';

interface TokenPayload {
  userId: string;
}

export function signToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN,
  };
  return jwt.sign({ userId } as TokenPayload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
