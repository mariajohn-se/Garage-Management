import winston from 'winston';

const REDACT_KEYS = ['password', 'newPassword', 'currentPassword', 'token', 'refreshToken', 'Pw'];

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    clean[key] = REDACT_KEYS.includes(key) ? '[REDACTED]' : value;
  }
  return clean;
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const cleanMeta = redact(meta);
      const metaStr = Object.keys(cleanMeta).length ? ` ${JSON.stringify(cleanMeta)}` : '';
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()]
});
