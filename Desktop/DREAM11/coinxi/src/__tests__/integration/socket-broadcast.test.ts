import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { io as ioc } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents, BookLevel, Trade } from '@/types/socket'

// Integration tests for Socket.IO broadcast shape — DO NOT use vi.useFakeTimers() here (Pitfall 3)

type TestServer = {
  io: Server<ClientToServerEvents, ServerToClientEvents>
  port: number
}

async function createTestServer(): Promise<TestServer> {
  return new Promise((resolve) => {
    const httpServer = createServer()
    const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      cors: { origin: '*' },
    })
    httpServer.listen(0, () => {
      const addr = httpServer.address()
      const port = typeof addr === 'object' && addr ? addr.port : 0
      resolve({ io, port })
    })
  })
}

function waitForEvent<T>(socket: ReturnType<typeof ioc>, event: string): Promise<T> {
  return new Promise((resolve) => {
    socket.once(event, (data: T) => resolve(data))
  })
}

function connectClient(port: number): ReturnType<typeof ioc> {
  return ioc(`http://localhost:${port}`, { transports: ['websocket'] })
}

async function waitForConnection(socket: ReturnType<typeof ioc>): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve()
      return
    }
    socket.once('connect', resolve)
    socket.once('connect_error', reject)
  })
}

describe('Socket.IO broadcast shape', () => {
  let server: TestServer
  let client: ReturnType<typeof ioc>

  beforeEach(async () => {
    server = await createTestServer()
    client = connectClient(server.port)
    await waitForConnection(client)
  })

  afterEach(() => {
    client.disconnect()
    server.io.close()
  })

  it('client receives "price" event with correct shape { pairId: string, price: string }', async () => {
    const eventPromise = waitForEvent<{ pairId: string; price: string }>(client, 'price')

    server.io.emit('price', { pairId: 'BTC/USDC', price: '50123.45' })

    const data = await eventPromise
    expect(data).toHaveProperty('pairId')
    expect(data).toHaveProperty('price')
    expect(typeof data.pairId).toBe('string')
    expect(typeof data.price).toBe('string')
    expect(data.pairId).toBe('BTC/USDC')
    expect(data.price).toBe('50123.45')
  })

  it('client receives "orderbook" event with { pairId, bids: BookLevel[], asks: BookLevel[] }', async () => {
    const bids: BookLevel[] = [
      { price: '50000.00', quantity: '1.50' },
      { price: '49900.00', quantity: '0.75' },
    ]
    const asks: BookLevel[] = [
      { price: '50100.00', quantity: '0.50' },
      { price: '50200.00', quantity: '2.00' },
    ]

    const eventPromise = waitForEvent<{ pairId: string; bids: BookLevel[]; asks: BookLevel[] }>(client, 'orderbook')

    server.io.emit('orderbook', { pairId: 'BTC/USDC', bids, asks })

    const data = await eventPromise
    expect(data).toHaveProperty('pairId', 'BTC/USDC')
    expect(Array.isArray(data.bids)).toBe(true)
    expect(Array.isArray(data.asks)).toBe(true)
    expect(data.bids).toHaveLength(2)
    expect(data.asks).toHaveLength(2)
  })

  it('client receives "trades" event with { pairId, trades: Trade[] }', async () => {
    const trades: Trade[] = [
      {
        id: 'trade-1',
        pairId: 'BTC/USDC',
        price: '50050.00',
        quantity: '0.10',
        side: 'buy',
        createdAt: new Date().toISOString(),
      },
    ]

    const eventPromise = waitForEvent<{ pairId: string; trades: Trade[] }>(client, 'trades')

    server.io.emit('trades', { pairId: 'BTC/USDC', trades })

    const data = await eventPromise
    expect(data).toHaveProperty('pairId', 'BTC/USDC')
    expect(Array.isArray(data.trades)).toBe(true)
    expect(data.trades[0]).toHaveProperty('price')
    expect(data.trades[0]).toHaveProperty('quantity')
    expect(data.trades[0]).toHaveProperty('side')
  })

  it('SECURITY T-02-01: orderbook payload does NOT contain userId field', async () => {
    const bids: BookLevel[] = [{ price: '50000.00', quantity: '1.00' }]
    const asks: BookLevel[] = [{ price: '50100.00', quantity: '1.00' }]

    const eventPromise = waitForEvent<Record<string, unknown>>(client, 'orderbook')

    // Simulate a correctly implemented broadcast (only BookLevel shape)
    server.io.emit('orderbook', { pairId: 'BTC/USDC', bids, asks } as any)

    const data = await eventPromise

    // The orderbook payload itself must not contain userId
    expect(data).not.toHaveProperty('userId')

    // Each bid must only have { price, quantity } — no userId, orderId, or other private fields
    const receivedBids = data['bids'] as Record<string, unknown>[]
    for (const bid of receivedBids) {
      expect(bid).not.toHaveProperty('userId')
      expect(bid).not.toHaveProperty('orderId')
      expect(bid).toHaveProperty('price')
      expect(bid).toHaveProperty('quantity')
    }

    // Each ask must only have { price, quantity }
    const receivedAsks = data['asks'] as Record<string, unknown>[]
    for (const ask of receivedAsks) {
      expect(ask).not.toHaveProperty('userId')
      expect(ask).not.toHaveProperty('orderId')
      expect(ask).toHaveProperty('price')
      expect(ask).toHaveProperty('quantity')
    }
  })

  it('bids and asks are arrays of exactly { price, quantity } objects with no extra fields', async () => {
    const bids: BookLevel[] = [{ price: '50000.00', quantity: '1.50' }]
    const asks: BookLevel[] = [{ price: '50100.00', quantity: '0.50' }]

    const eventPromise = waitForEvent<{ pairId: string; bids: BookLevel[]; asks: BookLevel[] }>(client, 'orderbook')

    server.io.emit('orderbook', { pairId: 'BTC/USDC', bids, asks })

    const data = await eventPromise

    // Verify bids have exactly price and quantity keys only
    expect(Object.keys(data.bids[0]).sort()).toEqual(['price', 'quantity'])
    expect(Object.keys(data.asks[0]).sort()).toEqual(['price', 'quantity'])
  })
})
