import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { registerBoardSockets } from './sockets/boardSockets.js';
import { socketAuthMiddleware } from './middleware/socketAuth.js';

export const createSocketServer = (
  httpServer: HttpServer,
  allowedOrigins: string[]
): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Socket.IO CORS policy: Origin ${origin} not allowed`));
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);
  io.on('connection', (socket) => {
    registerBoardSockets(io, socket);
  });

  return io;
};
