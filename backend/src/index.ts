import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { createSocketServer } from './socket.js';
import { prisma } from './config/db.js';

const port = process.env.PORT || 5000;

const start = async () => {
  const { app, allowedOrigins } = createApp();
  const server = http.createServer(app);
  const io = createSocketServer(server, allowedOrigins);

  app.set('io', io);

  await prisma.$connect(); // fails fast if DATABASE_URL is wrong or Postgres is down
  console.log('Connected to PostgreSQL');

  server.listen(port, () => {
    console.log(` Operational Engine initialized on target gateway port ${port}`);
  });

  const shutdown = async () => {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch((error) => {
  console.error('Backend startup failed:', error);
  process.exit(1);
});