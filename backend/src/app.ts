import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { passport } from './auth/passport';
import { apiRouter } from './controllers/routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(passport.initialize());
  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : false,
      credentials: true
    })
  );
  app.use(express.json());

  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  const prefix = process.env.API_PREFIX ?? '/api/v1';
  app.use(prefix, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
