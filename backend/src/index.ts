import 'dotenv/config'; 
import http from 'http';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { createSocketServer } from './socket.js';

const port = process.env.PORT || 5000;

const start = async () => {
  const { app, allowedOrigins } = createApp();
  const server = http.createServer(app);
  const io = createSocketServer(server, allowedOrigins);

  app.set('io', io);
  await connectDB();
  server.listen(port, () => {
    console.log(` Operational Engine initialized on target gateway port ${port}`);
  });
};

start().catch((error) => {
  console.error('Backend startup failed:', error);
  process.exit(1);
});