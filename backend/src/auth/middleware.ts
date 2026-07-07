import { Request, Response, NextFunction } from 'express';
import { passport } from './passport';
import { JwtPayload } from './jwt';
import { AuthError, ForbiddenError } from '../utils/errors';
import { Role } from '../models/User';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error | null, payload: JwtPayload | false) => {
    if (err) return next(err);
    if (!payload) return next(new AuthError('Session expired, please sign in again.', 'TOKEN_EXPIRED'));
    req.user = payload;
    next();
  })(req, res, next);
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthError('Authentication required.', 'TOKEN_EXPIRED'));
    }
    const hasRole = req.user.roles.some((role) => allowed.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }
    next();
  };
}
