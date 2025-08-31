'use client'

import { useDataCache, invalidateDataCache } from './useDataCache'

// Product interfaces that match admin API response
export interface Product {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  category?: {
    id: number
    name: string
    nameSwahili?: string
  }
  price: number
  wholesalePrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  unit?: string
  images?: Array<{
    id: number
    url: string
    filename: string
    originalName: string
    size: number
    mimeType: string
    isPrimary: boolean
    sortOrder: number
  }>
  isActive: boolean
  isDraft: boolean
  inventory?: {
    quantity: number
    reservedQuantity?: number
    reorderPoint?: number
    maxStock?: number
    location?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ProductsData {
  products: Product[]
  categories: string[]
  totalCount: number
  lowStockCount: number
}

// Products data fetcher
const fetchProductsData = async (businessId?: number): Promise<ProductsData> => {
  if (!businessId) {
    throw new Error('Business ID is required')
  }

  // Fetch products and categories in parallel
  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch(`/api/admin/products?businessId=${businessId}`),
    fetch(`/api/admin/categories?businessId=${businessId}`)
  ])

  if (!productsResponse.ok) {
    throw new Error('Failed to fetch products')
  }

  if (!categoriesResponse.ok) {
    throw new Error('Failed to fetch categories')
  }

  const productsData = await productsResponse.json()
  const categoriesData = await categoriesResponse.json()

  if (!productsData.success) {
    throw new Error(productsData.message || 'Failed to fetch products')
  }

  if (!categoriesData.success) {
    throw new Error(categoriesData.message || 'Failed to fetch categories')
  }

  const products: Product[] = productsData.data?.products || []
  // Extract category names from categories API response
  const categoriesArray = categoriesData.data?.categories || []
  const categories: string[] = categoriesArray.map((cat: { name: string }) => cat.name)
  
  // Calculate metrics
  const totalCount = products.length
  const lowStockCount = products.filter(p => {
    const stock = p.inventory?.quantity || 0
    const reorderPoint = p.inventory?.reorderPoint || 10
    return stock <= reorderPoint
  }).length

  return {
    products,
    categories,
    totalCount,
    lowStockCount
  }
}

// Custom hook for products data
export function useProductsData(businessId?: number, enabled: boolean = true) {
  return useDataCache<ProductsData>(
    'products',
    fetchProductsData,
    businessId,
    enabled
  )
}

// Cache invalidation utilities for products
export const ProductsCacheInvalidator = {
  // Invalidate when product is created/updated/deleted
  onProductChanged: (businessId: number) => {
    invalidateDataCache('products', businessId)
    // Also invalidate inventory cache
    invalidateDataCache('inventory', businessId)
  },

  // Invalidate when category is changed
  onCategoryChanged: (businessId: number) => {
    invalidateDataCache('products', businessId)
  },

  // Invalidate when stock is updated
  onStockChanged: (businessId: number) => {
    invalidateDataCache('products', businessId)
    invalidateDataCache('inventory', businessId)
  },

  // Clear all product cache
  invalidateAll: (businessId?: number) => {
    invalidateDataCache('products', businessId)
  }
}
