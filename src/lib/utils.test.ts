import { expect, test, describe } from 'bun:test';
import { escapeRegExp } from './utils';

describe('escapeRegExp', () => {
  test('should escape special regex characters', () => {
    const input = '.*+?^${}()|[Requested]\\';
    const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[Requested\\]\\\\';
    expect(escapeRegExp(input)).toBe(expected);
  });

  test('should return the same string if no special characters are present', () => {
    const input = 'normalString123';
    expect(escapeRegExp(input)).toBe(input);
  });

  test('should handle empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });

  test('should escape dots', () => {
    expect(escapeRegExp('v1.0.0')).toBe('v1\\.0\\.0');
  });

  test('should escape parentheses', () => {
    expect(escapeRegExp('user (admin)')).toBe('user \\(admin\\)');
  });
});
