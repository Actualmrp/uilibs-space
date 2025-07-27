// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value

  const publicPaths = ['/', '/main', '/changelog', '/library']

  // Allow public paths
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (
    !token &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Apply middleware to all routes you want protected
export const config = {
  matcher: [
    /*
      Protect everything except these public paths:
      you can adjust the paths here as needed
    */
    '/((?!auth|login|main|changelog|library).*)',
  ],
}