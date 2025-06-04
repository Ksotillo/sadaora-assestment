import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/profiles', // Allow GET requests to profiles list
  '/api/profiles/(.*)', // Allow GET requests to individual profiles
])

export default clerkMiddleware(async (auth, req) => {
  // For API routes, check if it's a protected method
  if (req.nextUrl.pathname.startsWith('/api/profiles')) {
    const method = req.method
    
    // Allow GET requests to be public (for reading profiles)
    // Protect POST, PUT, DELETE requests (for creating/updating/deleting)
    if (method !== 'GET') {
      await auth.protect()
    }
  } else if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
} 