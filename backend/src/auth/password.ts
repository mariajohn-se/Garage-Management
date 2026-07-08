import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const POLICY = {
  minLength: 10,
  requireUpper: /[A-Z]/,
  requireLower: /[a-z]/,
  requireDigit: /[0-9]/,
  requireSpecial: /[^A-Za-z0-9]/
};

export async function hashPassword(rawPassword: string): Promise<string> {
  return bcrypt.hash(rawPassword, SALT_ROUNDS);
}

export async function comparePasswords(raw: string, hashed: string): Promise<boolean> {
  // Legacy USERS.Pw values predate bcrypt and are stored as plain text - the column used to be
  // nvarchar(30), too narrow to hold a 60-char bcrypt hash, so nothing hashed could have been
  // written before it was widened (see UserRepository.ts). Fall back to a direct comparison
  // for those pre-existing rows.
  if (!hashed.startsWith('$2')) {
    return raw === hashed;
  }
  return bcrypt.compare(raw, hashed);
}

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < POLICY.minLength) {
    return `Password must be at least ${POLICY.minLength} characters.`;
  }
  if (!POLICY.requireUpper.test(password)) return 'Include at least one uppercase letter.';
  if (!POLICY.requireLower.test(password)) return 'Include at least one lowercase letter.';
  if (!POLICY.requireDigit.test(password)) return 'Include at least one number.';
  if (!POLICY.requireSpecial.test(password)) {
    return 'Include at least one special character (e.g. !@#...).';
  }
  return null;
}
