'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useRequireAuth(redirectUrl?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      // Still loading, don't redirect yet
      return
    }

    if (status === 'unauthenticated') {
      // Not authenticated, redirect to login
      const loginUrl = redirectUrl || '/login'
      router.replace(loginUrl)
      return
    }

    if (status === 'authenticated' && session) {
      // Authenticated, stop loading
      setIsLoading(false)
    }
  }, [status, session, router, redirectUrl])

  return {
    isLoading: status === 'loading' || isLoading,
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    session
  }
}

// Customer store auth hook with store-specific redirect
export function useRequireCustomerAuth(storeSlug: string) {
  return useRequireAuth(`/store/${storeSlug}/login`)
}

// Admin auth hook  
export function useRequireAdminAuth() {
  return useRequireAuth('/login')
} 