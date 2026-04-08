import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { placeLimitOrder, placeMarketOrder, getOrderBook } from '@/lib/matching-engine'
import { db } from '@/db'

export async function POST(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  let body: { pairId?: string; side?: string; type?: string; price?: string; quantity?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const { pairId, side, type, price, quantity } = body

  if (!pairId || !side || !type || !quantity) {
    return errorResponse('pairId, side, type, quantity are required', 400)
  }
  if (side !== 'buy' && side !== 'sell') {
    return errorResponse('side must be buy or sell', 400)
  }
  if (type !== 'market' && type !== 'limit') {
    return errorResponse('type must be market or limit', 400)
  }
  if (type === 'limit' && !price) {
    return errorResponse('price is required for limit orders', 400)
  }

  try {
    const order =
      type === 'limit'
        ? await placeLimitOrder(db, user.userId, pairId, side as 'buy' | 'sell', price!, quantity)
        : await placeMarketOrder(db, user.userId, pairId, side as 'buy' | 'sell', quantity)
    return jsonResponse(order, 201)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Order failed', 400)
  }
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const pairId = new URL(req.url).searchParams.get('pairId')
  if (!pairId) return errorResponse('pairId query param required', 400)

  const book = await getOrderBook(db, pairId)
  const userOrders = [...book.bids, ...book.asks].filter((o) => o.userId === user.userId)
  return jsonResponse(userOrders)
}
