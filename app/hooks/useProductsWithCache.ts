'use client'

import { useDataCache, invalidateDataCache } from './useDataCache'
import { useCallback } from 'react'

// Product interfaces (same as useProducts but simplified)
export interface Product {
  id: number
  name: string
  nameEnglish: string
  nameSwahili?: string
  description?: string
  sku?: string
  barcode?: string
  price: number
  wholesalePrice?: number
  costPrice?: number
  unit?: string
  imageUrl?: string
  images?: Array<{
    id: number
    url: string
    isPrimary: boolean
    sortOrder: number
  }>
  isActive: boolean
  category?: {
    id: number
    name: string
  }
  inventory?: {
    quantity: number
    availableQuantity: number
    reservedQuantity: number
    reorderPoint?: number
    maxStock?: number
    location?: string
    inStock: boolean
    lowStock: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  q?: string
  category?: number
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  active?: boolean
  sort?: 'name' | 'price' | 'created' | 'updated'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
  lang?: 'en' | 'sw'
}

export interface StoreProductsData {
  products: Product[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: ProductFilters
}

// 🚀 IMPROVED: Store products data fetcher with caching
const fetchStoreProductsData = async (businessSlug: string, filters: ProductFilters = {}): Promise<StoreProductsData> => {
  if (!businessSlug) {
    throw new Error('Business slug is required')
  }

  // Build query params
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString())
    }
  })

  const url = `/api/businesses/${businessSlug}/products?${params}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch products')
  }

  return {
    products: data.data.products || [],
    pagination: data.data.pagination || {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },
    filters
  }
}

// 🚀 IMPROVED: Custom hook for store products with caching
export function useStoreProducts(businessSlug: string, filters: ProductFilters = {}) {
  // Use dataCache with custom fetcher
  const fetcher = useCallback(async (): Promise<StoreProductsData> => {
    return fetchStoreProductsData(businessSlug, filters)
  }, [businessSlug, filters])

  const {
    data,
    isLoading,
    lastFetched,
    refreshData,
    clearCache,
    isCached,
    isStale,
    cacheStatus
  } = useDataCache<StoreProductsData>(
    'products', // Use products cache type
    fetcher,
    undefined, // No businessId since we use slug
    !!businessSlug // Only enabled when we have businessSlug
  )

  // Helper functions
  const getProduct = useCallback((productId: number): Product | undefined => {
    return data?.products?.find(p => p.id === productId)
  }, [data])

  const getProductsByCategory = useCallback((categoryId: number): Product[] => {
    return data?.products?.filter(p => p.category?.id === categoryId) || []
  }, [data])

  const searchProducts = useCallback((query: string): Product[] => {
    if (!query || !data?.products) return data?.products || []
    
    const lowercaseQuery = query.toLowerCase()
    return data.products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.nameEnglish.toLowerCase().includes(lowercaseQuery) ||
      (p.nameSwahili && p.nameSwahili.toLowerCase().includes(lowercaseQuery)) ||
      (p.description && p.description.toLowerCase().includes(lowercaseQuery)) ||
      (p.sku && p.sku.toLowerCase().includes(lowercaseQuery))
    )
  }, [data])

  // Cache invalidation for store products
  const invalidateStoreCache = useCallback(() => {
    // Invalidate this specific cache
    clearCache()
    
    // Also invalidate the general products cache
    invalidateDataCache('products')
  }, [clearCache])

  return {
    // Data
    products: data?.products || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },
    
    // Loading states
    loading: isLoading,
    isLoading,
    lastFetched,
    
    // Cache information
    isCached,
    isStale,
    cacheStatus,
    
    // Actions
    refetch: refreshData,
    refresh: refreshData,
    clearCache: invalidateStoreCache,
    
    // Helper functions
    getProduct,
    getProductsByCategory,
    searchProducts,
    
    // Filters
    currentFilters: filters,
    
    // Error (can be extended)
    error: null
  }
}

// Cache invalidation utilities for store products
export const StoreProductsCacheInvalidator = {
  // Invalidate when product is changed in store
  onStoreProductChanged: () => {
    // This would need a more sophisticated cache key pattern
    // For now, invalidate all products cache
    invalidateDataCache('products')
  },

  // Invalidate specific business store cache
  onBusinessStoreChanged: () => {
    invalidateDataCache('products')
  },

  // Clear all store product caches
  invalidateAll: () => {
    invalidateDataCache('products')
  }
}
