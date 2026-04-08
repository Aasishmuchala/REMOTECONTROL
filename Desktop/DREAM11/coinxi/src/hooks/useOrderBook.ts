'use client'

import { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket-client'
import { diffOrderBook, type DiffResult } from '@/lib/order-book-diff'
import type { BookLevel } from '@/types/socket'

export interface OrderBookState {
  bids: BookLevel[]
  asks: BookLevel[]
  bidsDiff: DiffResult
  asksDiff: DiffResult
}

const EMPTY_DIFF: DiffResult = {
  added: new Set(),
  updated: new Set(),
  removed: new Set(),
}

export function useOrderBook(pairId: string): OrderBookState {
  const [book, setBook] = useState<OrderBookState>({
    bids: [],
    asks: [],
    bidsDiff: EMPTY_DIFF,
    asksDiff: EMPTY_DIFF,
  })
  const prevRef = useRef<{ bids: BookLevel[]; asks: BookLevel[] }>({
    bids: [],
    asks: [],
  })

  useEffect(() => {
    const socket = getSocket()

    const handler = (data: { pairId: string; bids: BookLevel[]; asks: BookLevel[] }) => {
      if (data.pairId !== pairId) return

      const bidsDiff = diffOrderBook(prevRef.current.bids, data.bids)
      const asksDiff = diffOrderBook(prevRef.current.asks, data.asks)
      prevRef.current = { bids: data.bids, asks: data.asks }

      setBook({ bids: data.bids, asks: data.asks, bidsDiff, asksDiff })
    }

    socket.on('orderbook', handler)
    return () => {
      socket.off('orderbook', handler)
    }
  }, [pairId])

  return book
}
