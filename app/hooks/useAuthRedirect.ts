'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuthRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // If user is authenticated, redirect them away from auth pages
    if (status === 'authenticated' && session?.user) {
      setIsRedirecting(true)
      // Redirect to appropriate dashboard based on user role or default
      const redirectUrl = '/admin/dashboard' // You can make this dynamic based on user role
      router.replace(redirectUrl)
    }
  }, [status, session, router])

  // Return loading state and session info
  // Show loading if session is loading OR if we're redirecting authenticated user
  return {
    isLoading: status === 'loading' || isRedirecting,
    isAuthenticated: status === 'authenticated',
    session
  }
} 