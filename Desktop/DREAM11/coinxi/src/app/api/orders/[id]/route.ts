import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { cancelOrder } from '@/lib/matching-engine'
import { db } from '@/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const { id } = await params

  try {
    await cancelOrder(db, user.userId, id)
    return jsonResponse({ cancelled: true, id })
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Cancel failed', 400)
  }
}
