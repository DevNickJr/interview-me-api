import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { env } from '@/configs/env.config';
import { configurePassport } from '@/configs/passport.config';

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const PreRouteMiddleware = (app: Express): void => {
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(limiter);
  app.use(morgan('dev'));
  app.use(compression());
  app.use(express.json());
  app.use(helmet());

  configurePassport();
  app.use(passport.initialize());
};

export default PreRouteMiddleware;
