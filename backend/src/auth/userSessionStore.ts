/**
 * In-memory session/lockout tracker (BR-02, BR-05).
 * Sufficient for a single backend instance; swap for Redis if the app is ever scaled
 * horizontally, since this state does not survive a process restart or fan out across nodes.
 */

interface LockoutState {
  failedCount: number;
  lockedUntil: number | null;
}

const lockouts = new Map<number, LockoutState>();
const revokedRefreshTokens = new Set<string>();

const MAX_FAILED_LOGINS = parseInt(process.env.AUTH_LOCKOUT_ATTEMPTS ?? '5', 10);
const ACCOUNT_LOCK_MINS = parseInt(process.env.AUTH_LOCK_MINUTES ?? '15', 10);

export function recordFailedLogin(userId: number): { locked: boolean; failedCount: number } {
  const state = lockouts.get(userId) ?? { failedCount: 0, lockedUntil: null };
  state.failedCount += 1;
  if (state.failedCount >= MAX_FAILED_LOGINS) {
    state.lockedUntil = Date.now() + ACCOUNT_LOCK_MINS * 60 * 1000;
  }
  lockouts.set(userId, state);
  return { locked: state.lockedUntil !== null, failedCount: state.failedCount };
}

export function resetFailedLogins(userId: number): void {
  lockouts.delete(userId);
}

export function checkAccountLocked(userId: number): boolean {
  const state = lockouts.get(userId);
  if (!state?.lockedUntil) return false;
  if (Date.now() > state.lockedUntil) {
    lockouts.delete(userId);
    return false;
  }
  return true;
}

export function unlockAccount(userId: number): void {
  lockouts.delete(userId);
}

export function revokeRefreshToken(token: string): void {
  revokedRefreshTokens.add(token);
}

export function isRefreshTokenRevoked(token: string): boolean {
  return revokedRefreshTokens.has(token);
}
