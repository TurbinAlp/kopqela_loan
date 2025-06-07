'use client'

import { ReactNode } from 'react'
import { useBusiness } from '../../contexts/BusinessContext'

interface BusinessLoaderProps {
  children: ReactNode
}

export default function BusinessLoader({ children }: BusinessLoaderProps) {
  const { loading } = useBusiness()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading store...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 