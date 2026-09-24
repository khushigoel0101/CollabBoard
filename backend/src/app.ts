import express from 'express';
import cors from 'cors';
import boardRoutes from './routes/boardRoutes.js';
import { createCorsOptions, getAllowedOrigins } from './config/cors.js'
import cookieparser from 'cookie-parser';

export const createApp = () => {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(cors(createCorsOptions(allowedOrigins)));
  app.use(express.json());
  app.use(cookieparser());
  app.use('/api/boards', boardRoutes);

  return { app, allowedOrigins };
};
