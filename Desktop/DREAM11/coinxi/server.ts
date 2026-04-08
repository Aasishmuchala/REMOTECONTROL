import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { db } from './src/db/index.js'
import { getOrderBook, getRecentTrades } from './src/lib/matching-engine.js'
import { createSimulators, simulateTick } from './src/lib/price-simulator.js'
import type { ServerToClientEvents, ClientToServerEvents, BookLevel } from './src/types/socket.js'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'

const httpServer = createServer()
const app = next({ dev, hostname, port, httpServer })
const handle = app.getRequestHandler()

// SECURITY (T-02-01): Strip userId and other private fields from order book before broadcast.
// getOrderBook() returns full Order objects including userId — never send those to clients.
function safeBook(orders: { price: string | null; quantity: string }[]): BookLevel[] {
  return orders.map(({ price, quantity }) => ({
    price: price ?? '0',
    quantity,
  }))
}

app.prepare().then(() => {
  httpServer.on('request', (req, res) => {
    handle(req, res)
  })

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: '*' },
  })

  // Three independent price simulators, one per trading pair (per D-06)
  const simulators = createSimulators({
    'BTC-USDC': '50000.00',
    'ETH-USDC': '3000.00',
    'SOL-USDC': '100.00',
  })

  const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC']

  // Broadcast price, order book, and recent trades every 1 second (per D-03, D-04)
  setInterval(async () => {
    for (const pairId of PAIRS) {
      try {
        // Advance price simulation (per D-05)
        const price = simulateTick(simulators, pairId)

        // Re-query order book from DB and strip private fields (per D-08, T-02-01)
        const rawBook = await getOrderBook(db, pairId)
        const bids = safeBook(rawBook.bids.slice(0, 20))
        const asks = safeBook(rawBook.asks.slice(0, 20))

        // Query recent trades (per D-04)
        const recentTrades = await getRecentTrades(db, pairId, 50)

        // Global broadcast to all connected clients (per D-02)
        io.emit('price', { pairId, price })
        io.emit('orderbook', { pairId, bids, asks })
        io.emit('trades', { pairId, trades: recentTrades })
      } catch (err) {
        console.error(`Broadcast error for ${pairId}:`, err)
      }
    }
  }, 1000)

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
