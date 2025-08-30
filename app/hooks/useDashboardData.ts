'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

// Define interfaces for type safety
export interface DashboardStats {
  totalSales: string
  pendingCreditApps: string
  lowStock: string
  outstandingDebt: string
  todaysSales: string
  salesCount: string
  cashPayments: string
  creditSales: string
  pendingPayments: string
}

export interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: string
  date: string
  paymentPlan?: string
}

export interface RecentTransaction {
  id: string
  type: string
  customer: string
  amount: number
  time: string
  paymentMethod?: string
  status?: string
}

export interface SystemNotification {
  id: number
  message: string
  time: string
  type: string
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  recentTransactions: RecentTransaction[]
  systemNotifications: SystemNotification[]
  loading: boolean
  lastFetched?: Date
}

// In-memory cache for dashboard data
const dashboardCache = new Map<number, { data: DashboardData; timestamp: number }>()

// Industry-standard cache configuration (based on Shopify/Amazon patterns)
const CACHE_CONFIG = {
  // Fresh data duration (industry standard: 1-2 minutes for e-commerce)
  FRESH_TIME: 90 * 1000, // 90 seconds - data is considered fresh
  
  // Stale time before background refresh (industry standard: 30-60 seconds)
  STALE_TIME: 30 * 1000, // 30 seconds - trigger background revalidation
  
  // Maximum cache duration before forced refresh (industry standard: 5-10 minutes)
  MAX_CACHE_TIME: 5 * 60 * 1000, // 5 minutes - absolute maximum
  
  // Background refresh interval (industry standard: 15-60 seconds)
  REFRESH_INTERVAL: 45 * 1000, // 45 seconds
  
  // Deduplication interval (prevent duplicate requests)
  DEDUPE_INTERVAL: 5 * 1000, // 5 seconds
}



// Event listener for cache invalidation
const eventListeners: (() => void)[] = []

// Global cache invalidation function
export const invalidateDashboardCache = (businessId?: number) => {
  if (businessId) {
    dashboardCache.delete(businessId)
  } else {
    dashboardCache.clear()
  }
  
  // Notify all listening components
  eventListeners.forEach(listener => listener())
}

// Default dashboard data
const defaultDashboardData: DashboardData = {
  stats: {
    totalSales: "0",
    pendingCreditApps: "0", 
    lowStock: "0",
    outstandingDebt: "0",
    todaysSales: "0",
    salesCount: "0",
    cashPayments: "0",
    creditSales: "0",
    pendingPayments: "0"
  },
  recentOrders: [],
  recentTransactions: [],
  systemNotifications: [],
  loading: true,
  lastFetched: undefined
}

export function useDashboardData(businessId?: number) {
  const { showError } = useNotifications()
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isFetchingRef = useRef(false)

  // Function to check if cached data is still valid (fresh)
  const isCacheValid = useCallback((businessId: number): boolean => {
    const cached = dashboardCache.get(businessId)
    if (!cached) return false
    
    const now = Date.now()
    return (now - cached.timestamp) < CACHE_CONFIG.FRESH_TIME
  }, [])

  // Function to check if data is stale (needs background revalidation)
  const isCacheStale = useCallback((businessId: number): boolean => {
    const cached = dashboardCache.get(businessId)
    if (!cached) return true
    
    const now = Date.now()
    return (now - cached.timestamp) > CACHE_CONFIG.STALE_TIME
  }, [])

  // Function to get cached data
  const getCachedData = useCallback((businessId: number): DashboardData | null => {
    const cached = dashboardCache.get(businessId)
    if (!cached || !isCacheValid(businessId)) return null
    
    return cached.data
  }, [isCacheValid])

  // Function to set cached data
  const setCachedData = useCallback((businessId: number, data: DashboardData): void => {
    dashboardCache.set(businessId, {
      data,
      timestamp: Date.now()
    })
  }, [])

  // Function to clear expired cache entries
  const clearExpiredCache = useCallback(() => {
    const now = Date.now()
    for (const [businessId, cached] of dashboardCache.entries()) {
      if ((now - cached.timestamp) > CACHE_CONFIG.MAX_CACHE_TIME) {
        dashboardCache.delete(businessId)
      }
    }
  }, [])

  const fetchDashboardData = useCallback(async (businessId: number, forceRefresh = false, backgroundRevalidation = false) => {
    // Industry standard: Request deduplication
    if (isFetchingRef.current && !forceRefresh && !backgroundRevalidation) {
      return
    }

    // Industry standard: Check for recent requests (deduplication)
    const cached = dashboardCache.get(businessId)
    if (cached && !forceRefresh && !backgroundRevalidation) {
      const timeSinceLastFetch = Date.now() - cached.timestamp
      if (timeSinceLastFetch < CACHE_CONFIG.DEDUPE_INTERVAL) {
        return // Too soon, skip this request
      }
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(businessId)
      if (cachedData) {
        setDashboardData(cachedData)
        
        // Check if we need background revalidation
        if (isCacheStale(businessId) && !backgroundRevalidation) {
          // Fetch fresh data in background without showing loading
          fetchDashboardData(businessId, false, true)
        }
        
        return
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
        setDashboardData(prev => ({ ...prev, loading: true }))
      }

      // Clear expired cache entries
      clearExpiredCache()

      // Fetch dashboard statistics and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?businessId=${businessId}`, {
          signal: abortControllerRef.current.signal
        }),
        fetch(`/api/admin/dashboard/activities?businessId=${businessId}&limit=5`, {
          signal: abortControllerRef.current.signal
        })
      ])

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch dashboard activities')
      }

      const statsData = await statsResponse.json()
      const activitiesData = await activitiesResponse.json()

      if (!statsData.success) {
        throw new Error(statsData.message || 'Failed to fetch statistics')
      }

      if (!activitiesData.success) {
        throw new Error(activitiesData.message || 'Failed to fetch activities')
      }

      const newData: DashboardData = {
        stats: statsData.data.stats,
        recentOrders: activitiesData.data.recentOrders || [],
        recentTransactions: activitiesData.data.recentTransactions || [],
        systemNotifications: activitiesData.data.systemNotifications || [],
        loading: false,
        lastFetched: new Date()
      }

      // Cache the data
      setCachedData(businessId, newData)
      
      // Update state
      setDashboardData(newData)

    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      showError(
        'Data Loading Error',
        error instanceof Error ? error.message : 'Failed to load dashboard data'
      )
      
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false 
      }))
    } finally {
      isFetchingRef.current = false
    }
  }, [getCachedData, setCachedData, clearExpiredCache, showError, isCacheStale])

  // Refresh function to force fetch new data
  const refreshDashboardData = useCallback(() => {
    if (businessId) {
      fetchDashboardData(businessId, true)
    }
  }, [businessId, fetchDashboardData])

  // Clear cache function
  const clearCache = useCallback(() => {
    if (businessId) {
      dashboardCache.delete(businessId)
    }
  }, [businessId])

  // Effect to fetch data when businessId changes
  useEffect(() => {
    if (businessId) {
      fetchDashboardData(businessId)
      
      // Set up auto-refresh interval (every 2 minutes for background revalidation)
      const autoRefreshInterval = setInterval(() => {
        if (isCacheStale(businessId)) {
          fetchDashboardData(businessId, false, true) // Background revalidation
        }
      }, CACHE_CONFIG.REFRESH_INTERVAL)

      // Set up cache invalidation listener
      const invalidationListener = () => {
        fetchDashboardData(businessId, true) // Force refresh
      }
      
      eventListeners.push(invalidationListener)

      // Cleanup function
      return () => {
        clearInterval(autoRefreshInterval)
        
        // Remove invalidation listener
        const index = eventListeners.indexOf(invalidationListener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        isFetchingRef.current = false
      }
    } else {
      // Reset to default if no business
      setDashboardData(defaultDashboardData)
    }
  }, [businessId, fetchDashboardData, isCacheStale])

  // Return dashboard data and utility functions
  return {
    dashboardData,
    isLoading: dashboardData.loading,
    lastFetched: dashboardData.lastFetched,
    refreshData: refreshDashboardData,
    clearCache,
    isCached: businessId ? isCacheValid(businessId) : false,
    isStale: businessId ? isCacheStale(businessId) : false,
    cacheStatus: businessId ? (
      isCacheValid(businessId) ? 'fresh' : 
      isCacheStale(businessId) ? 'stale' : 'empty'
    ) : 'empty',
    error: null // You can extend this to track errors
  }
}
