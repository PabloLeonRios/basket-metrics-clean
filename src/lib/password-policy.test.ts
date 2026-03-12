import { expect, test, describe } from 'bun:test';
import { isPasswordStrong } from './password-policy';

describe('isPasswordStrong', () => {
  test('should return true for a strong password', () => {
    expect(isPasswordStrong('StrongPass1!')).toBe(true);
  });

  test('should return false if missing uppercase letter', () => {
    expect(isPasswordStrong('weakpass1!')).toBe(false);
  });

  test('should return false if missing number', () => {
    expect(isPasswordStrong('WeakPass!')).toBe(false);
  });

  test('should return false if missing special character', () => {
    expect(isPasswordStrong('WeakPass123')).toBe(false);
  });

  test('should return false if password is less than 8 characters', () => {
    expect(isPasswordStrong('Str1!')).toBe(false);
  });

  test('should return false for empty string', () => {
    expect(isPasswordStrong('')).toBe(false);
  });
});
