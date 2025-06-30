import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    
    // If user is authenticated and tries to access login page, redirect to dashboard
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    
    // If user is authenticated and tries to access register page, redirect to dashboard  
    if (token && pathname === '/register') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    
    // Additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to auth pages for non-authenticated users
        if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password') {
          return true
        }
        
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
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/cashier/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]
} 