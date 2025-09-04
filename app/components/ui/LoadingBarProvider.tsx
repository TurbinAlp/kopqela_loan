'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface LoadingBarContextType {
  startLoading: () => void
  stopLoading: () => void
  isLoading: boolean
  progress: number
}

const LoadingBarContext = createContext<LoadingBarContextType | undefined>(undefined)

export function useLoadingBar() {
  const context = useContext(LoadingBarContext)
  if (!context) {
    throw new Error('useLoadingBar must be used within a LoadingBarProvider')
  }
  return context
}

interface LoadingBarProviderProps {
  children: ReactNode
}

export function LoadingBarProvider({ children }: LoadingBarProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [])

  const startLoading = useCallback(() => {
    // Clear any existing timeouts to prevent double loading
    clearAllTimeouts()
    
    setIsLoading(true)
    setProgress(15)

    // Progressive loading simulation with faster initial progress
    const intervals = [
      { delay: 50, progress: 35 },
      { delay: 150, progress: 55 },
      { delay: 300, progress: 75 },
      { delay: 500, progress: 90 },
    ]

    intervals.forEach(({ delay, progress: targetProgress }) => {
      const timeout = setTimeout(() => {
        setProgress(prev => prev < targetProgress ? targetProgress : prev)
      }, delay)
      timeoutsRef.current.push(timeout)
    })

    // Auto-complete after 2.5 seconds if not manually stopped
    const autoCompleteTimeout = setTimeout(() => {
      setProgress(100)
      const finalTimeout = setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
        clearAllTimeouts()
      }, 300)
      timeoutsRef.current.push(finalTimeout)
    }, 2500)
    timeoutsRef.current.push(autoCompleteTimeout)
  }, [clearAllTimeouts])

  const stopLoading = useCallback(() => {
    clearAllTimeouts()
    setProgress(100)
    const timeout = setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 300)
    timeoutsRef.current.push(timeout)
  }, [clearAllTimeouts])

  return (
    <LoadingBarContext.Provider value={{ startLoading, stopLoading, isLoading, progress }}>
      {children}
    </LoadingBarContext.Provider>
  )
}
