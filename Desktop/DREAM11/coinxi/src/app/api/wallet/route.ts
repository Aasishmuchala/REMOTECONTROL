import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { getWallet } from '@/lib/wallet'
import { db } from '@/db'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const wallet = await getWallet(db, user.userId)
  if (!wallet) return errorResponse('Wallet not found', 404)

  return jsonResponse(wallet)
}
