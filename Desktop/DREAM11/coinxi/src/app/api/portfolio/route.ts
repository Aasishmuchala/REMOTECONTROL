import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { getTradeHistory } from '@/lib/wallet'
import { computePositions } from '@/lib/portfolio'
import { db } from '@/db'
import { tradingPairs } from '@/db/schema'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  let trades: Awaited<ReturnType<typeof getTradeHistory>>['trades']
  try {
    // Fetch all user trades without pagination limit (Pitfall 1: must not cap fills)
    const result = await getTradeHistory(db, user.userId, 1, 999999)
    trades = result.trades
  } catch {
    return errorResponse('Failed to load portfolio', 500)
  }

  // Fetch current prices for all trading pairs
  const pairs = await db.select().from(tradingPairs)
  const prices: Record<string, string> = {}
  pairs.forEach((p) => {
    prices[p.id] = p.lastPrice
  })

  // Compute positions server-side using decimal.js precision (D-04: aggregated only, not raw fills)
  const positions = computePositions(trades, prices)

  return jsonResponse(positions)
}
