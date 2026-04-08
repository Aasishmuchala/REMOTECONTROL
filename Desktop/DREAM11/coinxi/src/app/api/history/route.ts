import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { getTradeHistory } from '@/lib/wallet'
import { db } from '@/db'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const params = new URL(req.url).searchParams
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '50', 10)))

  const result = await getTradeHistory(db, user.userId, page, limit)
  return jsonResponse(result)
}
