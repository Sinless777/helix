// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'

// Mark routes that should require auth (adjust as needed)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next|static|.*\\..*|favicon.ico).*)',
    // Always run for API and tRPC routes
    '/(api|trpc)(.*)',
  ],
}
