import type { CorsOptions } from 'cors';

export const getAllowedOrigins = (): string[] =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

export const createCorsOptions = (allowedOrigins: string[]): CorsOptions => ({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true
});
