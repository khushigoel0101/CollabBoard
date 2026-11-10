import { Socket } from 'socket.io';
import { verifyAuthToken } from '../config/jwt.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readCookie = (rawCookie: string, name: string): string | undefined => {
  const entry = rawCookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : undefined;
};

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

    const rawCookieToken = readCookie(socket.handshake.headers.cookie ?? '', 'auth_token');
    const cookieToken = rawCookieToken ? decodeURIComponent(rawCookieToken) : undefined;

    const token = socket.handshake.auth?.token || bearerToken || cookieToken;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = verifyAuthToken(token);

    // Tokens issued before the Prisma migration carry Mongo ObjectIds
    if (!UUID_RE.test(payload.userId)) {
      return next(new Error('Session outdated, please log in again'));
    }

    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    socket.data.joinedBoards = new Set<string>();
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
}