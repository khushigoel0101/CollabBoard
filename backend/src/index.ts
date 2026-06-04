import 'dotenv/config'; 
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './config/db.js';
import boardRoutes from './routes/boardRoutes.js';
import { registerBoardSockets } from './sockets/boardSockets.js';

const app = express();
const port = process.env.PORT || 5000;

connectDB();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/boards', boardRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Socket.io CORS policy: Origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  registerBoardSockets(io, socket);
});

server.listen(port, () => {
  console.log(`🚀 Operational Engine initialized on target gateway port ${port}`);
});