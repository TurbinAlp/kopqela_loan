import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware() {
    // Additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Admin routes - require any authenticated user
        if (pathname.startsWith('/admin')) {
          return !!token
        }
        
        // POS routes - require authenticated user
        if (pathname.startsWith('/cashier')) {
          return !!token
        }
        
        // Default: allow access
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/cashier/:path*'
  ]
} 