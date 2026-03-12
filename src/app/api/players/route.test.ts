import { describe, expect, it, mock } from 'bun:test';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the dependencies
mock.module('@/lib/dbConnect', () => ({
  default: async () => {},
}));

mock.module('@/lib/auth', () => ({
  verifyAuth: async () => ({ payload: { role: 'admin', id: 'admin-id' } }),
}));

// Provide a mock implementation for Player model that captures the query
let lastQuery: Record<string, unknown> = {};
mock.module('@/lib/models/Player', () => {
  return {
    default: {
      find: (query: Record<string, unknown>) => {
        lastQuery = query;
        return {
          skip: () => ({
            limit: () => ({
              sort: () => Promise.resolve([]),
            }),
          }),
        };
      },
      countDocuments: () => Promise.resolve(0),
    },
  };
});

describe('GET /api/players (NoSQL Injection & Search tests)', () => {
  it('should securely handle regex search using escapeRegExp', async () => {
    // Attempted regex injection payload
    const injectionPayload = '.*';
    const req = new NextRequest(
      `http://localhost/api/players?search=${encodeURIComponent(injectionPayload)}`,
      {
        headers: new Headers({ cookie: 'token=mock-token' }),
      },
    );

    await GET(req);

    const andConditions = lastQuery.$and as Record<string, unknown>[];
    expect(andConditions).toBeDefined();

    // The $or condition handling the search
    const searchOrCondition = andConditions.find(
      (c: Record<string, unknown>) => c.$or,
    ) as { $or: Record<string, unknown>[] };
    expect(searchOrCondition).toBeDefined();

    const nameSearch = searchOrCondition.$or.find(
      (o: Record<string, unknown>) => o.name,
    ) as { name: { $regex: string; $options: string } };
    // Should be escaped as \.\*
    expect(nameSearch.name.$regex).toBe('\\.\\*');
    expect(nameSearch.name.$options).toBe('i');
  });

  it('should safely parse valid numeric search to dorsal', async () => {
    const req = new NextRequest(`http://localhost/api/players?search=12`, {
      headers: new Headers({ cookie: 'token=mock-token' }),
    });

    await GET(req);

    const andConditions = lastQuery.$and as Record<string, unknown>[];
    const searchOrCondition = andConditions.find(
      (c: Record<string, unknown>) => c.$or,
    ) as { $or: Record<string, unknown>[] };
    const dorsalSearch = searchOrCondition.$or.find(
      (o: Record<string, unknown>) => o.dorsal !== undefined,
    ) as { dorsal: number };

    expect(dorsalSearch).toBeDefined();
    expect(dorsalSearch.dorsal).toBe(12);
  });

  it('should not evaluate empty string or whitespace as dorsal 0', async () => {
    const req = new NextRequest(`http://localhost/api/players?search=%20%20`, {
      headers: new Headers({ cookie: 'token=mock-token' }),
    });

    await GET(req);

    const andConditions = lastQuery.$and as Record<string, unknown>[];
    const searchOrCondition = andConditions.find(
      (c: Record<string, unknown>) => c.$or,
    ) as { $or: Record<string, unknown>[] };
    const dorsalSearch = searchOrCondition.$or.find(
      (o: Record<string, unknown>) => o.dorsal !== undefined,
    ) as { dorsal: number };

    // Dorsal search should not exist for empty string or whitespace
    expect(dorsalSearch).toBeUndefined();
  });
});
