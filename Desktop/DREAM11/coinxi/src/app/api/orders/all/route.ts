import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, and, gte, inArray } from 'drizzle-orm'

const VALID_STATUSES = ['open', 'partial', 'filled', 'cancelled'] as const
type OrderStatus = typeof VALID_STATUSES[number]

const PENDING_STATUSES: OrderStatus[] = ['open', 'partial']
const HISTORICAL_STATUSES: OrderStatus[] = ['filled', 'cancelled']

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const status = new URL(req.url).searchParams.get('status')

  // Validate status param against whitelist (T-04-03)
  if (status !== null && !(VALID_STATUSES as readonly string[]).includes(status)) {
    return errorResponse('Invalid status. Must be one of: open, partial, filled, cancelled', 400)
  }

  // D-07 DoS protection: 7-day boundary for filled/cancelled orders at DB query level
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Two separate queries to enforce different date policies at the DB level.
  // Pending (open/partial): no date filter — always returned regardless of age.
  // Historical (filled/cancelled): gte date filter — DB never returns unbounded historical data.

  let pendingOrders: (typeof orders.$inferSelect)[] = []
  let historicalOrders: (typeof orders.$inferSelect)[] = []

  const isPendingStatus = status === null || PENDING_STATUSES.includes(status as OrderStatus)
  const isHistoricalStatus = status === null || HISTORICAL_STATUSES.includes(status as OrderStatus)

  if (isPendingStatus) {
    const pendingFilter = status
      ? and(eq(orders.userId, user.userId), eq(orders.status, status as OrderStatus))
      : and(eq(orders.userId, user.userId), inArray(orders.status, PENDING_STATUSES))
    pendingOrders = await db.select().from(orders).where(pendingFilter)
  }

  if (isHistoricalStatus) {
    // CRITICAL (D-07): gte applied at query level — prevents unbounded result sets
    const historicalFilter = status
      ? and(eq(orders.userId, user.userId), eq(orders.status, status as OrderStatus), gte(orders.createdAt, sevenDaysAgo))
      : and(eq(orders.userId, user.userId), inArray(orders.status, HISTORICAL_STATUSES), gte(orders.createdAt, sevenDaysAgo))
    historicalOrders = await db.select().from(orders).where(historicalFilter)
  }

  const allOrders = [...pendingOrders, ...historicalOrders]

  // Sort newest first for display
  allOrders.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))

  return jsonResponse(allOrders)
}
