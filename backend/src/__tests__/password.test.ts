import { validatePasswordPolicy, hashPassword, comparePasswords } from '../auth/password';

describe('validatePasswordPolicy', () => {
  it('rejects passwords shorter than 10 characters', () => {
    expect(validatePasswordPolicy('Ab1!Ab1!')).toMatch(/at least 10 characters/);
  });

  it('requires an uppercase letter', () => {
    expect(validatePasswordPolicy('abcdefgh1!')).toMatch(/uppercase/);
  });

  it('requires a lowercase letter', () => {
    expect(validatePasswordPolicy('ABCDEFGH1!')).toMatch(/lowercase/);
  });

  it('requires a digit', () => {
    expect(validatePasswordPolicy('Abcdefgh!!')).toMatch(/number/);
  });

  it('requires a special character', () => {
    expect(validatePasswordPolicy('Abcdefgh12')).toMatch(/special character/);
  });

  it('accepts a compliant password', () => {
    expect(validatePasswordPolicy('Str0ng!Passw0rd')).toBeNull();
  });
});

describe('password hashing', () => {
  it('hashes and verifies a password round-trip', async () => {
    const hash = await hashPassword('Str0ng!Passw0rd');
    expect(hash).not.toEqual('Str0ng!Passw0rd');
    await expect(comparePasswords('Str0ng!Passw0rd', hash)).resolves.toBe(true);
    await expect(comparePasswords('WrongPassword1!', hash)).resolves.toBe(false);
  });
});
