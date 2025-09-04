'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useLoadingBar } from './LoadingBarProvider'

export default function LoadingBar() {
  const { isLoading, progress, stopLoading } = useLoadingBar()
  const pathname = usePathname()
  const previousPathnameRef = useRef(pathname)

  // Stop loading when navigation completes (only on actual route change)
  useEffect(() => {
    if (pathname !== previousPathnameRef.current && isLoading) {
      // Small delay to ensure page has started loading
      const timer = setTimeout(() => {
        stopLoading()
      }, 100)
      
      previousPathnameRef.current = pathname
      
      return () => clearTimeout(timer)
    }
  }, [pathname, isLoading, stopLoading])

  // Initialize previous pathname on mount
  useEffect(() => {
    previousPathnameRef.current = pathname
  }, [pathname])

  if (!isLoading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-100">
      <div
        className="h-full bg-gradient-to-r from-teal-500 via-blue-500 to-emerald-500 transition-all duration-300 ease-out relative overflow-hidden"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 8px rgba(20, 184, 166, 0.6)',
        }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
      </div>
    </div>
  )
}
