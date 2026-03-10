import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { configurePassport } from './config/passport';
import routes from './routes';
import { corsOptions } from './config/cors.config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
// app.use(cors(corsOptions));
// app.options(/.*/, (req, res) => {
//   console.log('got here')
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header(
//     'Access-Control-Allow-Methods',
//     'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
//   );
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Content-Type, Authorization, tempauth, x-client-type, Cache-Control, cache-control, pragma'
//   );
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.sendStatus(200); // Respond to preflight requests
// });
// app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Passport
configurePassport();
app.use(passport.initialize());

// Routes
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/ping', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
