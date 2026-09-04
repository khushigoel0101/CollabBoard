import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, InvalidTokenError, ExpiredTokenError } from '../config/jwt.js';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAuthToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof ExpiredTokenError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(403).json({ error: 'Invalid token' });
    }
  }
};

export default { requireAuth };