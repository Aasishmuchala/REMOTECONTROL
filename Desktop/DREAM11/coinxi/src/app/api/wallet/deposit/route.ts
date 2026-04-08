import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { creditWallet } from '@/lib/wallet'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  // Admin-only: verify isAdmin from DB, not JWT
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, user.userId))
  const dbUser = rows[0]
  if (!dbUser?.isAdmin) return errorResponse('Forbidden: admin only', 403)

  let body: { userId?: string; amount?: string; note?: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body', 400)
  }

  const targetUserId = body.userId || user.userId
  const { amount, note } = body

  if (!amount || typeof amount !== 'string') {
    return errorResponse('amount is required and must be a decimal string', 400)
  }

  try {
    const tx = await creditWallet(db, targetUserId, amount, note || 'Admin deposit')
    return jsonResponse({ transaction: tx }, 201)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Deposit failed', 400)
  }
}
