import { NextResponse } from 'next/server';

const REQUIRED_PASSWORD = process.env.APP_PASSWORD || 'P@ss1234';

export function middleware(request) {
  const password = request.headers.get('x-app-password');

  // Allow API routes and public paths without password
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check password for all other routes
  if (!password || password !== REQUIRED_PASSWORD) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing password' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
