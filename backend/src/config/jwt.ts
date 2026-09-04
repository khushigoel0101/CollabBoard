import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
};

export const jwtPayloadSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export class InvalidTokenError extends Error {}
export class ExpiredTokenError extends Error {}

export function verifyAuthToken(token: string): JwtPayload {
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ExpiredTokenError('Token expired');
    }
    throw new InvalidTokenError('Invalid token');
  }

  const parsed = jwtPayloadSchema.safeParse(decoded);
  if (!parsed.success) {
    throw new InvalidTokenError('Invalid token payload');
  }

  return parsed.data;
}