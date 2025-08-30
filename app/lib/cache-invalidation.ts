'use client'

import { invalidateDashboardCache } from '../hooks/useDashboardData'

// Cache invalidation utilities
export class CacheInvalidator {
  // Invalidate dashboard cache when new data is created
  static onOrderCreated(businessId: number) {
    invalidateDashboardCache(businessId)
  }

  static onPaymentReceived(businessId: number) {
    invalidateDashboardCache(businessId)
  }

  static onProductUpdated(businessId: number) {
    invalidateDashboardCache(businessId)
  }

  static onCustomerAdded(businessId: number) {
    invalidateDashboardCache(businessId)
  }

  static onInventoryChanged(businessId: number) {
    invalidateDashboardCache(businessId)
  }

  // Generic cache invalidation
  static invalidateAll() {
    invalidateDashboardCache()
  }

  // Invalidate specific business cache
  static invalidateBusiness(businessId: number) {
    invalidateDashboardCache(businessId)
  }
}

// Event-based cache invalidation (can be used with WebSockets later)
export const setupCacheInvalidationEvents = () => {
  // Listen for custom events
  if (typeof window !== 'undefined') {
    window.addEventListener('cache:invalidate:dashboard', ((event: CustomEvent) => {
      const { businessId } = event.detail || {}
      invalidateDashboardCache(businessId)
    }) as EventListener)

    window.addEventListener('cache:invalidate:all', () => {
      invalidateDashboardCache()
    })
  }
}

// Trigger cache invalidation event
export const triggerCacheInvalidation = (type: 'dashboard' | 'all', businessId?: number) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(`cache:invalidate:${type}`, {
      detail: { businessId }
    })
    window.dispatchEvent(event)
  }
}

// Hook to use cache invalidation
export const useCacheInvalidation = () => {
  return {
    invalidateDashboard: (businessId?: number) => invalidateDashboardCache(businessId),
    invalidateAll: () => invalidateDashboardCache(),
    onOrderCreated: CacheInvalidator.onOrderCreated,
    onPaymentReceived: CacheInvalidator.onPaymentReceived,
    onProductUpdated: CacheInvalidator.onProductUpdated,
    onCustomerAdded: CacheInvalidator.onCustomerAdded,
    onInventoryChanged: CacheInvalidator.onInventoryChanged
  }
}
