import crypto from 'crypto';

interface ResetTokenEntry {
  userId: number;
  expiresAt: number;
}

const RESET_TOKEN_TTL_MINUTES = parseInt(process.env.RESET_TOKEN_TTL_MINUTES ?? '30', 10);
const tokens = new Map<string, ResetTokenEntry>();

export function issueResetToken(userId: number): string {
  const token = crypto.randomBytes(32).toString('hex');
  tokens.set(token, { userId, expiresAt: Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000 });
  return token;
}

export function consumeResetToken(token: string): number | null {
  const entry = tokens.get(token);
  if (!entry) return null;
  tokens.delete(token);
  if (Date.now() > entry.expiresAt) return null;
  return entry.userId;
}
