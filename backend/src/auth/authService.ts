import { Request } from 'express';
import mssql from 'mssql';
import { userRepository } from '../repositories/UserRepository';
import { hashPassword, comparePasswords, validatePasswordPolicy } from './password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from './jwt';
import {
  recordFailedLogin,
  resetFailedLogins,
  checkAccountLocked,
  unlockAccount,
  revokeRefreshToken,
  isRefreshTokenRevoked
} from './userSessionStore';
import { issueResetToken, consumeResetToken } from './resetTokenStore';
import { logUserEvent } from './userlog';
import { AuthError, LockedError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { SessionUser, UserLogEntry } from '../models/User';
import { logger } from '../utils/logger';

export class AuthService {
  async login(req: Request, username: string, password: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new AuthError('Incorrect username or password.');
    }

    if (checkAccountLocked(user.id)) {
      await logUserEvent(req, { userId: user.id, userName: user.username, action: 'Failed Sign In' });
      throw new LockedError('Account is locked due to multiple failed sign-in attempts.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is inactive. Contact your administrator.', 'ACCOUNT_DISABLED');
    }

    const valid = await comparePasswords(password, user.passwordHash);
    if (!valid) {
      const { locked } = recordFailedLogin(user.id);
      await logUserEvent(req, {
        userId: user.id,
        userName: user.username,
        action: locked ? 'Lockout' : 'Failed Sign In'
      });
      if (locked) {
        throw new LockedError('Account is locked due to multiple failed sign-in attempts.');
      }
      throw new AuthError('Incorrect username or password.');
    }

    resetFailedLogins(user.id);
    await logUserEvent(req, { userId: user.id, userName: user.username, action: 'Sign In' });

    const payload: JwtPayload = { sub: user.id, username: user.username, roles: user.roles };
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      roles: user.roles,
      status: 'active'
    };

    return { token, refreshToken, user: sessionUser };
  }

  async logout(req: Request, refreshToken: string | undefined): Promise<void> {
    if (refreshToken) revokeRefreshToken(refreshToken);
    if (req.user) {
      await logUserEvent(req, { userId: req.user.sub, userName: req.user.username, action: 'Sign Out' });
    }
  }

  async refresh(refreshToken: string) {
    if (isRefreshTokenRevoked(refreshToken)) {
      throw new AuthError('Session expired, please sign in again.', 'TOKEN_EXPIRED');
    }
    const payload = verifyRefreshToken(refreshToken);
    const token = signAccessToken({ sub: payload.sub, username: payload.username, roles: payload.roles });
    return { token };
  }

  /**
   * BR-04/BR-09 call for an emailed reset link, but the live USERS/EmployeeDet schema has
   * no email column (see UserRepository.ts header). This still honors the "never reveal
   * whether the account exists" contract, but cannot actually deliver anything today - it
   * logs the would-be reset link instead. Wire in a real email source once one exists.
   */
  async requestPasswordReset(req: Request, identifier: string): Promise<void> {
    const user = await userRepository.findByUsername(identifier);
    if (!user) {
      logger.info('Password reset requested for unknown account');
      return;
    }
    const token = issueResetToken(user.id);
    const resetUrl = `${process.env.FRONTEND_URL ?? ''}/reset-password?token=${token}`;
    logger.warn('No email address available for this user - reset link not delivered', {
      userId: user.id,
      resetUrl
    });
    await logUserEvent(req, { userId: user.id, userName: user.username, action: 'Password Reset Request' });
  }

  async resetPassword(req: Request, token: string, newPassword: string): Promise<void> {
    const userId = consumeResetToken(token);
    if (!userId) {
      throw new ValidationError('This reset link is invalid or has expired.', 'INVALID_TOKEN');
    }
    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) {
      throw new ValidationError(policyError, 'INVALID_PASSWORD');
    }
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, passwordHash);
    unlockAccount(userId);
    await logUserEvent(req, { userId, userName: user.username, action: 'Password Reset' });
  }

  async changePassword(req: Request, userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const valid = await comparePasswords(currentPassword, user.passwordHash);
    if (!valid) {
      throw new ValidationError('Current password is incorrect.', 'INVALID_PASSWORD');
    }
    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) {
      throw new ValidationError(policyError, 'INVALID_PASSWORD');
    }
    if (await comparePasswords(newPassword, user.passwordHash)) {
      throw new ValidationError('You cannot reuse a recent password.', 'INVALID_PASSWORD');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, passwordHash);
    await logUserEvent(req, { userId, userName: user.username, action: 'Password Change' });
  }

  async unlockAccountByAdmin(req: Request, targetUserId: number): Promise<void> {
    const user = await userRepository.findById(targetUserId);
    if (!user) throw new NotFoundError('User not found.');
    // Only clears the in-memory failed-login lockout counter. Deliberately does NOT touch
    // USERS.Disable - that's a separate, persisted "deactivated" concept owned by
    // UserService.updateUser()/the /users/{id}/activate endpoint (Phase 2). Conflating the
    // two would let "unlock" silently reactivate an intentionally-disabled account.
    unlockAccount(targetUserId);
    await logUserEvent(req, { userId: targetUserId, userName: user.username, action: 'Account Unlocked' });
  }

  async getUserLog(filters: {
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
  }): Promise<UserLogEntry[]> {
    return userRepository.getUserLog(filters);
  }

  async testOdbcConnection(connectionString: string): Promise<void> {
    let pool: mssql.ConnectionPool | null = null;
    try {
      pool = await new mssql.ConnectionPool(connectionString).connect();
    } catch {
      throw new ValidationError(
        'Could not connect to ODBC source. Check credentials and connection string.',
        'ODBC_CONNECTION_FAILED'
      );
    } finally {
      await pool?.close().catch(() => undefined);
    }
  }

  async getSession(userId: number): Promise<SessionUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found.');
    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
      status: user.isActive ? 'active' : 'inactive'
    };
  }
}

export const authService = new AuthService();
