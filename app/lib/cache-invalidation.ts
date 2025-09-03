import { invalidateDashboardCache } from '../hooks/useDashboardData'
import { ProductsCacheInvalidator } from '../hooks/useProductsData'
import { CustomersCacheInvalidator } from '../hooks/useCustomersData'
import { OrdersCacheInvalidator } from '../hooks/useOrdersData'

// Master Cache invalidation utilities - coordinates all cache invalidation
export class CacheInvalidator {
  
  // When new order is created
  static onOrderCreated(businessId: number) {
    invalidateDashboardCache(businessId)
    OrdersCacheInvalidator.onOrderChanged(businessId)
    CustomersCacheInvalidator.onCustomerOrderPlaced(businessId)
  }

  // When payment is received
  static onPaymentReceived(businessId: number) {
    invalidateDashboardCache(businessId)
    OrdersCacheInvalidator.onPaymentReceived(businessId)
    CustomersCacheInvalidator.onCustomerPaymentReceived(businessId)
  }

  // When product is created/updated/deleted
  static onProductChanged(businessId: number) {
    invalidateDashboardCache(businessId)
    ProductsCacheInvalidator.onProductChanged(businessId)
  }

  // When customer is added/updated
  static onCustomerChanged(businessId: number) {
    invalidateDashboardCache(businessId)
    CustomersCacheInvalidator.onCustomerChanged(businessId)
  }

  // When inventory/stock changes
  static onInventoryChanged(businessId: number) {
    invalidateDashboardCache(businessId)
    ProductsCacheInvalidator.onStockChanged(businessId)
  }

  // When product category changes
  static onCategoryChanged(businessId: number) {
    ProductsCacheInvalidator.onCategoryChanged(businessId)
  }

  // When order status changes
  static onOrderStatusChanged(businessId: number) {
    invalidateDashboardCache(businessId)
    OrdersCacheInvalidator.onOrderStatusChanged(businessId)
  }

  // Generic cache invalidation - clears ALL caches
  static invalidateAll(businessId?: number) {
    invalidateDashboardCache(businessId)
    ProductsCacheInvalidator.invalidateAll(businessId)
    CustomersCacheInvalidator.invalidateAll(businessId)
    OrdersCacheInvalidator.invalidateAll(businessId)
  }

  // Invalidate specific business cache
  static invalidateBusiness(businessId: number) {
    this.invalidateAll(businessId)
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
    onProductChanged: CacheInvalidator.onProductChanged,
    onCustomerChanged: CacheInvalidator.onCustomerChanged,
    onInventoryChanged: CacheInvalidator.onInventoryChanged
  }
}
