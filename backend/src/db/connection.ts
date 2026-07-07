import mssql from 'mssql';
import { logger } from '../utils/logger';

const config: mssql.config = {
  server: process.env.DB_HOST as string,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    enableArithAbort: true,
    trustServerCertificate: true,
    // SQL Server 2008 predates TDS 8.0/modern TLS - forcing encryption breaks the handshake
    // against it under current OpenSSL defaults. Override via DB_ENCRYPT=true for newer instances.
    encrypt: process.env.DB_ENCRYPT === 'true'
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    min: 0,
    idleTimeoutMillis: 30000
  }
};

export const mssqlPool = new mssql.ConnectionPool(config);

let connecting: Promise<mssql.ConnectionPool> | null = null;

export function getPool(): Promise<mssql.ConnectionPool> {
  if (mssqlPool.connected) return Promise.resolve(mssqlPool);
  if (!connecting) {
    connecting = mssqlPool.connect().catch((err) => {
      connecting = null;
      logger.error('Database connection failed', { error: err.message });
      throw err;
    });
  }
  return connecting;
}

export async function checkDbHealth(): Promise<boolean> {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    return true;
  } catch (err) {
    logger.error('DB health check failed', { error: (err as Error).message });
    return false;
  }
}
