import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validateRequest = (schema: ZodObject<any>) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Failed',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
        return;
      }
      res.status(500).json({ error: 'Internal schema validation failure' });
    }
  };