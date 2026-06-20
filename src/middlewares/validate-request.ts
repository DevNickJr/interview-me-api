import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape } from 'zod';

const validateRequest =
  (schemas: ZodObject<ZodRawShape>[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      for (const schema of schemas) {
        const result = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        if (result.body) req.body = result.body;
        if (result.query) req.query = result.query as typeof req.query;
        if (result.params) req.params = result.params as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
