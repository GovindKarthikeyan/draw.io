// Next.js Middleware with Application Insights tracking
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Application Insights middleware tracking is primarily done on the server side
// This middleware logs request information that can be tracked by the server-side telemetry

export function middleware(request: NextRequest) {
  const start = Date.now();

  // Clone the response
  const response = NextResponse.next();

  // Add custom headers for tracking
  response.headers.set('x-request-id', crypto.randomUUID());
  response.headers.set('x-request-start', start.toString());

  // Log middleware execution (will be picked up by server-side App Insights if configured)
  if (process.env.NODE_ENV === 'production') {
    console.log(
      `[Middleware] ${request.method} ${request.url} - Started at ${new Date(start).toISOString()}`
    );
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
