import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { configurePassport } from './config/passport';
import routes from './routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Passport
configurePassport();
app.use(passport.initialize());

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
