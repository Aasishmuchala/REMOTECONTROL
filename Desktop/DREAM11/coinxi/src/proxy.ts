import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'

const protectedPages = ['/trade', '/portfolio', '/history']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedPage = protectedPages.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  )
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthEndpoint = pathname.startsWith('/api/auth/')

  // Only intercept protected pages and non-auth API routes
  if (!isProtectedPage && !(isApiRoute && !isAuthEndpoint)) {
    return NextResponse.next()
  }

  const user = getAuthUser(request)

  if (!user) {
    if (isApiRoute) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/trade/:path*',
    '/portfolio/:path*',
    '/history/:path*',
    '/api/:path*',
  ],
}
