'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if component is running on client side
 * Prevents hydration errors by ensuring consistent server/client rendering
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
