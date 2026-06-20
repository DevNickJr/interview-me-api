import { env } from '@/configs/env.config';

export const corsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
