'use client'

import { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket-client'

interface PriceFeedState {
  price: string
  direction: 'up' | 'down' | 'neutral'
}

export function usePriceFeed(pairId: string): PriceFeedState {
  const [state, setState] = useState<PriceFeedState>({
    price: '--',
    direction: 'neutral',
  })
  const prevPriceRef = useRef<string | null>(null)

  useEffect(() => {
    const socket = getSocket()

    const handler = (data: { pairId: string; price: string }) => {
      if (data.pairId !== pairId) return

      const prev = prevPriceRef.current
      let direction: 'up' | 'down' | 'neutral' = 'neutral'
      if (prev !== null) {
        const prevNum = parseFloat(prev)
        const currNum = parseFloat(data.price)
        if (currNum > prevNum) direction = 'up'
        else if (currNum < prevNum) direction = 'down'
      }

      prevPriceRef.current = data.price
      setState({ price: data.price, direction })
    }

    socket.on('price', handler)
    return () => {
      socket.off('price', handler)
    }
  }, [pairId])

  return state
}
