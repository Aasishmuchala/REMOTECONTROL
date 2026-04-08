import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { getOrderBook } from '@/lib/matching-engine'
import { db } from '@/db'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const pairId = new URL(req.url).searchParams.get('pairId')
  if (!pairId) return errorResponse('pairId query param required', 400)

  const book = await getOrderBook(db, pairId)
  return jsonResponse(book)
}
