export interface BookLevel {
  price: string
  quantity: string
}

export interface Trade {
  id: string
  pairId: string
  price: string
  quantity: string
  side: 'buy' | 'sell'
  createdAt: string
}

export interface ServerToClientEvents {
  price: (data: { pairId: string; price: string }) => void
  orderbook: (data: { pairId: string; bids: BookLevel[]; asks: BookLevel[] }) => void
  trades: (data: { pairId: string; trades: Trade[] }) => void
}

export interface ClientToServerEvents {
  // No client-to-server events in Phase 2
}
