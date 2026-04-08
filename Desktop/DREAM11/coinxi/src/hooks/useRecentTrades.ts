'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket-client'
import type { Trade } from '@/types/socket'

interface RecentTradesState {
  trades: Trade[]
}

export function useRecentTrades(pairId: string): RecentTradesState {
  const [state, setState] = useState<RecentTradesState>({ trades: [] })

  useEffect(() => {
    const socket = getSocket()

    const handler = (data: { pairId: string; trades: Trade[] }) => {
      if (data.pairId !== pairId) return
      setState({ trades: data.trades })
    }

    socket.on('trades', handler)
    return () => {
      socket.off('trades', handler)
    }
  }, [pairId])

  return state
}
