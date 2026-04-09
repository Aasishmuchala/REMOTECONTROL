import { vi } from 'vitest'

// Set test environment variables before any module loads
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production'
process.env.NODE_ENV = 'test'

// Mock next/server so NextRequest is available in Node test environment
vi.mock('next/server', () => {
  class MockNextRequest {
    headers: Map<string, string>
    constructor(_url: string, init?: { headers?: Record<string, string> }) {
      this.headers = new Map(Object.entries(init?.headers ?? {}))
    }
    // biome-ignore lint: test mock
    get(key: string) { return this.headers.get(key.toLowerCase()) ?? null }
  }
  // Expose get on headers directly
  return {
    NextRequest: class {
      headers: { get: (k: string) => string | null }
      constructor(_url: string, init?: { headers?: Record<string, string> }) {
        const h = new Map(Object.entries(init?.headers ?? {}))
        this.headers = { get: (k: string) => h.get(k.toLowerCase()) ?? null }
      }
    },
    NextResponse: {
      json: (data: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(data), {
          ...init,
          headers: { 'content-type': 'application/json' },
        }),
    },
  }
})
