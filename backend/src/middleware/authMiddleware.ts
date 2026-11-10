import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, ExpiredTokenError } from '../config/jwt.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const payload = verifyAuthToken(token);

    // Tokens issued before the Prisma migration carry Mongo ObjectIds
    if (!UUID_RE.test(payload.userId)) {
      res.status(401).json({ error: 'Session outdated, please log in again' });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof ExpiredTokenError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
};

export default { requireAuth };