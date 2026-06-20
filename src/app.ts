import express from 'express';
import PreRouteMiddleware from '@/middlewares/pre-route.middleware';
import ErrorMiddleware from '@/middlewares/error.middleware';
import { initializeRoutes } from '@/routes';

const app = express();

// Pre-route middleware
PreRouteMiddleware(app);

// Health checks
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/ping', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
initializeRoutes(app);

// Error handling
ErrorMiddleware(app);

export default app;
