import { JwtPayload } from '../auth/jwt';

declare global {
  namespace Express {
    // @types/passport already declares Request.user?: Express.User - extend that
    // interface (rather than redeclaring Request.user) so passport-jwt's req.user
    // and our own code agree on the shape without a conflicting merge.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends JwtPayload {}
  }
}

export {};
