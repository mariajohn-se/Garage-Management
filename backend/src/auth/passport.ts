import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { userRepository } from '../repositories/UserRepository';
import { comparePasswords } from './password';

// passport-local: verifies credentials against the live USERS table (per STANDARDS.md).
// Used via a manual passport.authenticate(...)(req, res, next) callback in AuthController
// rather than as route middleware, so the resulting User stays out of req.user (which is
// reserved for the JWT payload attached on protected routes - see express.d.ts).
passport.use(
  new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username: string, password: string, done) => {
      try {
        const user = await userRepository.findByUsername(username);
        if (!user) return done(null, false);
        const valid = await comparePasswords(password, user.passwordHash);
        if (!valid) return done(null, false);
        return done(null, { sub: user.id, username: user.username, roles: user.roles });
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// passport-jwt: verifies the Bearer token on protected routes (per STANDARDS.md).
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string
    },
    (payload, done) => done(null, payload)
  )
);

export { passport };
