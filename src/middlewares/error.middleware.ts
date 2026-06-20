import { Express, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import CustomError from '@/utils/CustomError';

const ErrorMiddleware = (app: Express): void => {
  // 404 handler
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new CustomError('Route not found', 404));
  });

  // Error handler
  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      if (err instanceof CustomError) {
        res.status(err.status).json({ message: err.message });
        return;
      }

      if (err instanceof ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          errors: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      console.error('Unhandled error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  );
};

export default ErrorMiddleware;
