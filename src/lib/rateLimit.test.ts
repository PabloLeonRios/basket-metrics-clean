import { expect, test, describe, setSystemTime, afterEach } from 'bun:test';
import { rateLimit } from './rateLimit';

describe('rateLimit', () => {
  afterEach(() => {
    setSystemTime();
  });

  test('should allow the first request', () => {
    const result = rateLimit('ip1', 5, 1000);
    expect(result).toEqual({ success: true, remaining: 4 });
  });

  test('should allow subsequent requests within the limit', () => {
    rateLimit('ip2', 3, 1000);
    const result2 = rateLimit('ip2', 3, 1000);
    const result3 = rateLimit('ip2', 3, 1000);

    expect(result2).toEqual({ success: true, remaining: 1 });
    expect(result3).toEqual({ success: true, remaining: 0 });
  });

  test('should block requests exceeding the limit', () => {
    rateLimit('ip3', 2, 1000);
    rateLimit('ip3', 2, 1000);
    const result3 = rateLimit('ip3', 2, 1000);
    const result4 = rateLimit('ip3', 2, 1000);

    expect(result3).toEqual({ success: false, remaining: 0 });
    expect(result4).toEqual({ success: false, remaining: 0 });
  });

  test('should reset the limit after the window has passed', () => {
    const baseTime = new Date('2024-01-01T00:00:00.000Z');
    setSystemTime(baseTime);

    rateLimit('ip4', 2, 1000);
    rateLimit('ip4', 2, 1000);

    const blockedResult = rateLimit('ip4', 2, 1000);
    expect(blockedResult).toEqual({ success: false, remaining: 0 });

    // Advance time beyond windowMs (1000ms)
    setSystemTime(new Date(baseTime.getTime() + 1001));

    const resultAfterWindow = rateLimit('ip4', 2, 1000);
    expect(resultAfterWindow).toEqual({ success: true, remaining: 1 });
  });

  test('should track limits independently for different IPs', () => {
    rateLimit('ip5', 1, 1000);

    // ip5 should be blocked
    const resultIp5 = rateLimit('ip5', 1, 1000);
    expect(resultIp5).toEqual({ success: false, remaining: 0 });

    // ip6 should be allowed
    const resultIp6 = rateLimit('ip6', 1, 1000);
    expect(resultIp6).toEqual({ success: true, remaining: 0 });
  });
});
