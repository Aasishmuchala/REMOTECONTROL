/**
 * RED phase tests for /api/orders/all and /api/portfolio endpoints.
 *
 * Tests will FAIL until the route handlers are fully implemented (GREEN phase).
 *
 * Coverage:
 *  - Status filtering: open, filled, all
 *  - 7-day date filter for filled/cancelled (D-07 DoS protection)
 *  - Auth gate: 401 for unauthenticated requests
 *  - IDOR protection: users can only see their own orders
 *  - Status whitelist validation: 400 for invalid status
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTestDb, seedUser, seedTradingPair } from '../helpers/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(url: string, token?: string) {
  const headers: Record<string, string> = {}
  if (token) headers['authorization'] = `Bearer ${token}`
  return { url, headers: { get: (k: string) => headers[k.toLowerCase()] ?? null } } as unknown as import('next/server').NextRequest
}

// ─── Module-level setup ───────────────────────────────────────────────────────

const TEST_USER_ID = 'user-test-001'
const OTHER_USER_ID = 'user-other-002'
const PAIR_ID = 'BTC-USDC'

// Valid token stub — getAuthUser is mocked per test
const VALID_TOKEN = 'test-valid-token'

// ─── Orders All Tests ─────────────────────────────────────────────────────────

describe('GET /api/orders/all', () => {
  let db: ReturnType<typeof createTestDb>['db']
  let sqlite: ReturnType<typeof createTestDb>['sqlite']

  beforeEach(async () => {
    const testDb = createTestDb()
    db = testDb.db
    sqlite = testDb.sqlite

    // Seed users and trading pair
    seedUser(sqlite, TEST_USER_ID, 'testuser')
    seedUser(sqlite, OTHER_USER_ID, 'otheruser')
    seedTradingPair(sqlite, PAIR_ID, 'BTC', 'USDC', '50000')

    // Dates for 7-day boundary test
    const now = new Date()
    const withinWindow = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const outsideWindow = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()

    // Insert orders for TEST_USER_ID
    sqlite.prepare(`
      INSERT INTO orders (id, user_id, pair_id, side, type, quantity, status, created_at)
      VALUES
        ('ord-open-1', '${TEST_USER_ID}', '${PAIR_ID}', 'buy', 'limit', '1', 'open', '${now.toISOString()}'),
        ('ord-partial-1', '${TEST_USER_ID}', '${PAIR_ID}', 'sell', 'limit', '0.5', 'partial', '${now.toISOString()}'),
        ('ord-filled-recent', '${TEST_USER_ID}', '${PAIR_ID}', 'buy', 'market', '0.1', 'filled', '${withinWindow}'),
        ('ord-filled-old', '${TEST_USER_ID}', '${PAIR_ID}', 'buy', 'market', '0.2', 'filled', '${outsideWindow}'),
        ('ord-cancelled-recent', '${TEST_USER_ID}', '${PAIR_ID}', 'sell', 'limit', '0.3', 'cancelled', '${withinWindow}'),
        ('ord-cancelled-old', '${TEST_USER_ID}', '${PAIR_ID}', 'sell', 'limit', '0.4', 'cancelled', '${outsideWindow}')
    `).run()

    // Insert order for OTHER_USER_ID (IDOR test)
    sqlite.prepare(`
      INSERT INTO orders (id, user_id, pair_id, side, type, quantity, status, created_at)
      VALUES ('ord-other-open', '${OTHER_USER_ID}', '${PAIR_ID}', 'buy', 'limit', '1', 'open', '${now.toISOString()}')
    `).run()
  })

  afterEach(() => {
    sqlite.close()
    vi.restoreAllMocks()
  })

  it('Test 1: returns only open orders for authenticated user when status=open', async () => {
    // Mock getAuthUser to return test user
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue({ userId: TEST_USER_ID, username: 'testuser' }),
      }
    })
    // Mock db to use test database
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all?status=open`, VALID_TOKEN)
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.every((o: { status: string }) => o.status === 'open')).toBe(true)
    expect(body.some((o: { id: string }) => o.id === 'ord-open-1')).toBe(true)
    expect(body.some((o: { id: string }) => o.id === 'ord-partial-1')).toBe(false)
  })

  it('Test 2: returns only filled orders from last 7 days when status=filled', async () => {
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue({ userId: TEST_USER_ID, username: 'testuser' }),
      }
    })
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all?status=filled`, VALID_TOKEN)
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.every((o: { status: string }) => o.status === 'filled')).toBe(true)
    expect(body.some((o: { id: string }) => o.id === 'ord-filled-recent')).toBe(true)
  })

  it('Test 3: excludes filled orders older than 7 days (D-07 DoS protection)', async () => {
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue({ userId: TEST_USER_ID, username: 'testuser' }),
      }
    })
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all?status=filled`, VALID_TOKEN)
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    // ord-filled-old is 10 days ago — must be excluded
    expect(body.some((o: { id: string }) => o.id === 'ord-filled-old')).toBe(false)
  })

  it('Test 4: with no status param returns open/partial always and filled/cancelled within 7 days', async () => {
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue({ userId: TEST_USER_ID, username: 'testuser' }),
      }
    })
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all`, VALID_TOKEN)
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    const ids = body.map((o: { id: string }) => o.id)
    // Open and partial always returned
    expect(ids).toContain('ord-open-1')
    expect(ids).toContain('ord-partial-1')
    // Filled/cancelled within 7 days included
    expect(ids).toContain('ord-filled-recent')
    expect(ids).toContain('ord-cancelled-recent')
    // Filled/cancelled older than 7 days excluded
    expect(ids).not.toContain('ord-filled-old')
    expect(ids).not.toContain('ord-cancelled-old')
  })

  it('Test 5: returns 400 for invalid status param', async () => {
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue({ userId: TEST_USER_ID, username: 'testuser' }),
      }
    })
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all?status=invalid_status`, VALID_TOKEN)
    const res = await GET(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('Test 6: returns 401 for unauthenticated requests', async () => {
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue(null),
      }
    })
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all`)
    const res = await GET(req)

    expect(res.status).toBe(401)
  })

  it('Test 7: does not return other users\' orders (IDOR protection)', async () => {
    vi.doMock('@/lib/auth', async (importOriginal) => {
      const actual = await importOriginal<typeof import('@/lib/auth')>()
      return {
        ...actual,
        getAuthUser: vi.fn().mockReturnValue({ userId: TEST_USER_ID, username: 'testuser' }),
      }
    })
    vi.doMock('@/db', () => ({ db }))

    const { GET } = await import('@/app/api/orders/all/route')
    const req = makeRequest(`http://localhost/api/orders/all`, VALID_TOKEN)
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    // Must not contain orders from OTHER_USER_ID
    expect(body.some((o: { id: string }) => o.id === 'ord-other-open')).toBe(false)
    // All returned orders must belong to TEST_USER_ID
    expect(body.every((o: { userId: string }) => o.userId === TEST_USER_ID)).toBe(true)
  })
})
