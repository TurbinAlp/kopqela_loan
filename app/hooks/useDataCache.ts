'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

// Industry-standard cache configuration for all pages
const CACHE_CONFIG = {
  // Fresh data duration (varies by page type)
  FRESH_TIME: {
    products: 2 * 60 * 1000,    // 2 minutes - products change less frequently
    customers: 3 * 60 * 1000,   // 3 minutes - customer data is more static
    orders: 60 * 1000,          // 1 minute - orders change frequently
    inventory: 30 * 1000,       // 30 seconds - inventory is very dynamic
  },
  
  // Stale time before background refresh
  STALE_TIME: {
    products: 60 * 1000,        // 1 minute
    customers: 90 * 1000,       // 1.5 minutes  
    orders: 30 * 1000,          // 30 seconds
    inventory: 15 * 1000,       // 15 seconds
  },
  
  // Maximum cache duration before forced refresh
  MAX_CACHE_TIME: 10 * 60 * 1000, // 10 minutes for all
  
  // Background refresh intervals
  REFRESH_INTERVAL: {
    products: 2 * 60 * 1000,    // 2 minutes
    customers: 3 * 60 * 1000,   // 3 minutes
    orders: 60 * 1000,          // 1 minute  
    inventory: 30 * 1000,       // 30 seconds
  },
  
  // Deduplication interval
  DEDUPE_INTERVAL: 3 * 1000, // 3 seconds
}

// Cache type definitions
type CacheType = 'products' | 'customers' | 'orders' | 'inventory'

interface CacheEntry<T> {
  data: T
  timestamp: number
  businessId?: number
}

// 🚀 IMPROVED: Hybrid cache storage (localStorage + memory for persistence)
const memoryCache = new Map<string, CacheEntry<unknown>>()
const STORAGE_PREFIX = 'kopqela_cache_'
const STORAGE_VERSION = 'v1_'

// Event listeners for cache invalidation
const eventListeners = new Map<string, (() => void)[]>()

// Persistent cache utilities
const persistentCache = {
  // Get data from cache (memory first, then localStorage)
  get: <T>(key: string): CacheEntry<T> | null => {
    // 1. Check memory cache first (fastest)
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as CacheEntry<T>
    }
    
    // 2. Check localStorage (persistent)
    if (typeof window !== 'undefined') {
      try {
        const storageKey = STORAGE_PREFIX + STORAGE_VERSION + key
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as CacheEntry<T>
          // Restore to memory cache for faster access
          memoryCache.set(key, parsed)
          return parsed
        }
      } catch (error) {
        console.warn('Error reading from localStorage cache:', error)
      }
    }
    
    return null
  },

  // Set data in both memory and localStorage
  set: <T>(key: string, value: CacheEntry<T>): void => {
    // 1. Set in memory cache
    memoryCache.set(key, value)
    
    // 2. Set in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const storageKey = STORAGE_PREFIX + STORAGE_VERSION + key
        localStorage.setItem(storageKey, JSON.stringify(value))
      } catch (error) {
        console.warn('Error writing to localStorage cache:', error)
        // If localStorage fails, continue with memory cache only
      }
    }
  },

  // Delete from both caches
  delete: (key: string): void => {
    memoryCache.delete(key)
    
    if (typeof window !== 'undefined') {
      try {
        const storageKey = STORAGE_PREFIX + STORAGE_VERSION + key
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Error deleting from localStorage cache:', error)
      }
    }
  },

  // Clear expired entries from both caches
  clearExpired: (maxAge: number): void => {
    const now = Date.now()
    
    // Clear from memory
    for (const [key, cached] of memoryCache.entries()) {
      if ((now - cached.timestamp) > maxAge) {
        memoryCache.delete(key)
      }
    }
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        const keysToDelete: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith(STORAGE_PREFIX + STORAGE_VERSION)) {
            const value = localStorage.getItem(key)
            if (value) {
              try {
                const parsed = JSON.parse(value)
                if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
                  keysToDelete.push(key)
                }
              } catch {
                // Invalid cache entry, mark for deletion
                keysToDelete.push(key)
              }
            }
          }
        }
        
        keysToDelete.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('Error clearing expired localStorage cache:', error)
      }
    }
  },

  // Get all cache entries (for debugging)
  entries: (): [string, CacheEntry<unknown>][] => {
    return Array.from(memoryCache.entries())
  }
}

// 🚀 IMPROVED: Global cache invalidation function with persistent cache
export const invalidateDataCache = (cacheType: CacheType, businessId?: number) => {
  const cacheKey = businessId ? `${cacheType}_${businessId}` : cacheType
  persistentCache.delete(cacheKey)
  
  // Notify all listening components
  const listeners = eventListeners.get(cacheKey) || []
  listeners.forEach(listener => listener())
  
  // 🚀 NEW: Cross-tab cache invalidation
  if (typeof window !== 'undefined') {
    try {
      // Broadcast to other tabs using localStorage event
      const invalidationKey = 'kopqela_cache_invalidation'
      const invalidationData = {
        cacheKey,
        timestamp: Date.now(),
        action: 'invalidate'
      }
      localStorage.setItem(invalidationKey, JSON.stringify(invalidationData))
      // Remove immediately to trigger storage event
      localStorage.removeItem(invalidationKey)
    } catch (error) {
      console.warn('Error broadcasting cache invalidation:', error)
    }
  }
}

// Generic data fetcher type
type DataFetcher<T> = (businessId?: number) => Promise<T>

// Generic cache hook
export function useDataCache<T>(
  cacheType: CacheType,
  fetcher: DataFetcher<T>,
  businessId?: number,
  enabled: boolean = true
) {
  const { showError } = useNotifications()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isFetchingRef = useRef(false)
  
  const cacheKey = businessId ? `${cacheType}_${businessId}` : cacheType
  
  // Get cache configuration for this type
  const freshTime = CACHE_CONFIG.FRESH_TIME[cacheType]
  const staleTime = CACHE_CONFIG.STALE_TIME[cacheType]
  const refreshInterval = CACHE_CONFIG.REFRESH_INTERVAL[cacheType]
  
  // 🚀 IMPROVED: Function to check if cached data is still valid (fresh)
  const isCacheValid = useCallback((key: string): boolean => {
    const cached = persistentCache.get<T>(key)
    if (!cached) return false
    
    const now = Date.now()
    return (now - cached.timestamp) < freshTime
  }, [freshTime])

  // 🚀 IMPROVED: Function to check if data is stale (needs background revalidation)
  const isCacheStale = useCallback((key: string): boolean => {
    const cached = persistentCache.get<T>(key)
    if (!cached) return true
    
    const now = Date.now()
    return (now - cached.timestamp) > staleTime
  }, [staleTime])

  // 🚀 IMPROVED: Function to get cached data with stale-while-revalidate support
  const getCachedData = useCallback((key: string): T | null => {
    const cached = persistentCache.get<T>(key)
    if (!cached) return null
    
    // Return data even if stale (stale-while-revalidate pattern)
    return cached.data as T
  }, [])

  // 🚀 IMPROVED: Function to set cached data in persistent storage
  const setCachedData = useCallback((key: string, newData: T): void => {
    persistentCache.set(key, {
      data: newData,
      timestamp: Date.now(),
      businessId
    })
  }, [businessId])

  // 🚀 IMPROVED: Function to clear expired cache entries from persistent storage
  const clearExpiredCache = useCallback(() => {
    persistentCache.clearExpired(CACHE_CONFIG.MAX_CACHE_TIME)
  }, [])

  const fetchData = useCallback(async (forceRefresh = false, backgroundRevalidation = false) => {
    if (!enabled) return
    
    // Industry standard: Request deduplication
    if (isFetchingRef.current && !forceRefresh && !backgroundRevalidation) {
      return
    }

    // 🚀 IMPROVED: Check for recent requests (deduplication) with persistent cache
    const cached = persistentCache.get<T>(cacheKey)
    if (cached && !forceRefresh && !backgroundRevalidation) {
      const timeSinceLastFetch = Date.now() - cached.timestamp
      if (timeSinceLastFetch < CACHE_CONFIG.DEDUPE_INTERVAL) {
        return // Too soon, skip this request
      }
    }

    // 🚀 IMPROVED: Stale-while-revalidate strategy
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        // Always show cached data immediately (even if stale)
        setData(cachedData)
        setIsLoading(false)
        
        // If cache is stale, fetch fresh data in background
        if (isCacheStale(cacheKey) && !backgroundRevalidation) {
          // 🚀 Background revalidation - no loading indicator
          fetchData(false, true)
        }
        
        // If cache is fresh, no need to fetch
        if (isCacheValid(cacheKey)) {
          return
        }
        
        // Continue to fetch fresh data if cache is invalid but show cached data first
        if (!isCacheValid(cacheKey) && !backgroundRevalidation) {
          // This means cache exists but is not valid, still show it and fetch fresh
          return
        }
      }
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    isFetchingRef.current = true

    try {
      // Only show loading if not background revalidation
      if (!backgroundRevalidation) {
        setIsLoading(true)
      }

      // Clear expired cache entries
      clearExpiredCache()

      // Fetch fresh data
      const freshData = await fetcher(businessId)
      
      // Cache the data
      setCachedData(cacheKey, freshData)
      
      // Update state
      setData(freshData)
      setLastFetched(new Date())
      setIsLoading(false)

    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      showError(
        'Data Loading Error',
        error instanceof Error ? error.message : `Failed to load ${cacheType} data`
      )
      
      setIsLoading(false)
    } finally {
      isFetchingRef.current = false
    }
  }, [
    enabled, cacheKey, getCachedData, setCachedData, 
    clearExpiredCache, fetcher, businessId, isCacheStale, isCacheValid, showError, cacheType
  ])

  // Refresh function to force fetch new data
  const refreshData = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // 🚀 IMPROVED: Clear cache function with persistent storage
  const clearCache = useCallback(() => {
    persistentCache.delete(cacheKey)
  }, [cacheKey])

  // 🚀 IMPROVED: Effect to fetch data with cross-tab cache invalidation
  useEffect(() => {
    if (enabled) {
      fetchData()
      
      // Set up auto-refresh interval
      const autoRefreshInterval = setInterval(() => {
        if (isCacheStale(cacheKey)) {
          fetchData(false, true) // Background revalidation
        }
      }, refreshInterval)

      // Set up cache invalidation listener (same tab)
      const invalidationListener = () => {
        fetchData(true) // Force refresh
      }
      
      const listeners = eventListeners.get(cacheKey) || []
      listeners.push(invalidationListener)
      eventListeners.set(cacheKey, listeners)

      // 🚀 NEW: Cross-tab cache invalidation listener
      const crossTabInvalidationListener = (e: StorageEvent) => {
        if (e.key === 'kopqela_cache_invalidation' && e.newValue) {
          try {
            const invalidationData = JSON.parse(e.newValue)
            if (invalidationData.cacheKey === cacheKey && invalidationData.action === 'invalidate') {
              // Another tab invalidated this cache, force refresh
              fetchData(true)
            }
          } catch (error) {
            console.warn('Error parsing cross-tab cache invalidation:', error)
          }
        }
      }

      // 🚀 NEW: Listen for storage events (cross-tab communication)
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', crossTabInvalidationListener)
      }

      // Cleanup function
      return () => {
        clearInterval(autoRefreshInterval)
        
        // Remove invalidation listener
        const currentListeners = eventListeners.get(cacheKey) || []
        const index = currentListeners.indexOf(invalidationListener)
        if (index > -1) {
          currentListeners.splice(index, 1)
          eventListeners.set(cacheKey, currentListeners)
        }

        // Remove cross-tab listener
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', crossTabInvalidationListener)
        }
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        isFetchingRef.current = false
      }
    }
  }, [enabled, cacheKey, fetchData, refreshInterval, isCacheStale])

  // Return data and utility functions
  return {
    data,
    isLoading,
    lastFetched,
    refreshData,
    clearCache,
    isCached: isCacheValid(cacheKey),
    isStale: isCacheStale(cacheKey),
    cacheStatus: isCacheValid(cacheKey) ? 'fresh' : 
                 isCacheStale(cacheKey) ? 'stale' : 'empty',
    error: null // You can extend this to track errors
  }
}
