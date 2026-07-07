import { describe, expect, it } from 'vitest';
import { validatePasswordPolicy } from './validators';

describe('validatePasswordPolicy', () => {
  it('rejects a short password', () => {
    expect(validatePasswordPolicy('Ab1!')).toMatch(/at least 10 characters/);
  });

  it('accepts a compliant password', () => {
    expect(validatePasswordPolicy('Str0ng!Passw0rd')).toBeNull();
  });
});
