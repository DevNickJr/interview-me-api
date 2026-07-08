import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { configurePassport } from '@/configs/passport.config';
import { corsOptions } from '@/configs/cors.config';

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const PreRouteMiddleware = (app: Express): void => {
  app.use(cors(corsOptions));

    // Handle preflight requests explicitly
  app.options(/.*/, (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, tempauth, x-client-type, Cache-Control, cache-control, pragma'
    );
    res.setHeader('Access-Control-Max-Age', '300');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200); // Respond to preflight requests
  });

    // extends the requestAnimationFrame.query object with a setter
  app.use((req, _res, next) => {
    Object.defineProperty(req, 'query', {
      ...Object.getOwnPropertyDescriptor(req, 'query'),
      value: req.query,
      writable: true,
    });
    next();
  });

  // Middleware to conditionally apply JSON parsing
  app.use(express.json({
    verify: (req, _, buf) => {
      (req as any).rawBody = buf.toString('utf8');
    },
  }));

  app.use(limiter);
  app.use(morgan('dev'));
  app.use(compression());
  app.use(express.json());
  app.use(helmet());

  configurePassport();
  app.use(passport.initialize());
};

export default PreRouteMiddleware;
