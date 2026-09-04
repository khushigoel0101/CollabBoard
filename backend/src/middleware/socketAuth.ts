import { Socket } from 'socket.io';
import { verifyAuthToken } from '../config/jwt.js';

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyAuthToken(token);
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    socket.data.joinedBoards = new Set<string>();
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
}