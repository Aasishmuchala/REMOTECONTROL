import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/auth'

// Stub — full implementation in Task 3 (GREEN phase)
export async function GET(_req: NextRequest) {
  return errorResponse('Not implemented', 501)
}
