import { Request, Response, NextFunction } from 'express';
import { authService } from '../auth/authService';
import { ValidationError } from '../utils/errors';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body ?? {};
      if (!username || !password) {
        throw new ValidationError('Username and password are required.');
      }
      const result = await authService.login(req, username, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req, req.body?.refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body ?? {};
      if (!refreshToken) throw new ValidationError('refreshToken is required.');
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async passwordResetRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body ?? {};
      if (!email) throw new ValidationError('Enter your username or email.');
      await authService.requestPasswordReset(req, email);
      res.json({ message: 'If the account exists, a password reset link has been sent to your email.' });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body ?? {};
      if (!token || !newPassword) throw new ValidationError('Token and new password are required.');
      await authService.resetPassword(req, token, newPassword);
      res.json({ message: 'Password reset successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body ?? {};
      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current and new password are required.');
      }
      await authService.changePassword(req, req.user!.sub, currentPassword, newPassword);
      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async unlockAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body ?? {};
      if (!userId) throw new ValidationError('userId is required.');
      await authService.unlockAccountByAdmin(req, userId);
      res.json({ message: 'Account unlocked.' });
    } catch (err) {
      next(err);
    }
  }

  async userLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, dateFrom, dateTo, eventType } = req.query;
      const entries = await authService.getUserLog({
        userId: userId ? Number(userId) : undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
        eventType: eventType as string | undefined
      });
      res.json(entries);
    } catch (err) {
      next(err);
    }
  }

  async session(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await authService.getSession(req.user!.sub);
      res.json(session);
    } catch (err) {
      next(err);
    }
  }

  // NOTE: API_SPEC_v12.md never defines an endpoint for FRONTEND_SPEC_v12.md's "ODBC Sign In"
  // page (section 3) - this is a gap in the generated spec set. These two endpoints are a
  // reasonable best-effort fill: odbc-test-connection genuinely opens the given ODBC/SQL
  // connection string, and odbc-login checks credentials the same way normal login does,
  // since no separate ODBC identity store exists in DB_CONNECTION_SPEC_v12.md.
  async odbcTestConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { connectionString } = req.body ?? {};
      if (!connectionString) throw new ValidationError('Connection string is required.');
      await authService.testOdbcConnection(connectionString);
      res.json({ success: true, message: 'Connection succeeded.' });
    } catch (err) {
      next(err);
    }
  }

  async odbcLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body ?? {};
      if (!username || !password) {
        throw new ValidationError('Username and password are required.');
      }
      const result = await authService.login(req, username, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
