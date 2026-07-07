import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../models/User';

export interface JwtPayload {
  sub: number;
  username: string;
  roles: Role[];
}

function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRY ?? '2h') as SignOptions['expiresIn'] };
  return jwt.sign(payload, requireSecret('JWT_SECRET'), options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY ?? '30d') as SignOptions['expiresIn']
  };
  return jwt.sign(payload, requireSecret('REFRESH_TOKEN_SECRET'), options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, requireSecret('JWT_SECRET')) as unknown as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, requireSecret('REFRESH_TOKEN_SECRET')) as unknown as JwtPayload;
}
