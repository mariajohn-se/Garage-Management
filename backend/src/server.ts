import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { getPool } from './db/connection';
import { logger } from './utils/logger';

const REQUIRED_ENV = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];

function assertEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function main() {
  assertEnv();
  const app = createApp();
  const port = parseInt(process.env.PORT ?? '3001', 10);

  getPool()
    .then(() => logger.info('Connected to SQL Server'))
    .catch((err) =>
      logger.error('Initial DB connection failed - server will still start; /health will report degraded', {
        error: err.message
      })
    );

  app.listen(port, () => {
    logger.info(`Backend listening on port ${port}`);
  });
}

main();
