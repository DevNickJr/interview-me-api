import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
}

export function signToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as any,
  };
  return jwt.sign({ userId } as TokenPayload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
