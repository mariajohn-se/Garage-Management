import { recordFailedLogin, resetFailedLogins, checkAccountLocked, unlockAccount } from '../auth/userSessionStore';

describe('userSessionStore lockout tracking', () => {
  const userId = Math.floor(Math.random() * 1_000_000);

  afterEach(() => {
    unlockAccount(userId);
  });

  it('does not lock an account before the failure threshold', () => {
    for (let i = 0; i < 4; i++) recordFailedLogin(userId);
    expect(checkAccountLocked(userId)).toBe(false);
  });

  it('locks an account after 5 failed attempts', () => {
    for (let i = 0; i < 5; i++) recordFailedLogin(userId);
    expect(checkAccountLocked(userId)).toBe(true);
  });

  it('clears the lock when reset or unlocked', () => {
    for (let i = 0; i < 5; i++) recordFailedLogin(userId);
    expect(checkAccountLocked(userId)).toBe(true);
    resetFailedLogins(userId);
    expect(checkAccountLocked(userId)).toBe(false);
  });
});
