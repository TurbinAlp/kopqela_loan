import { useState, useEffect, useCallback } from 'react'

interface Product {
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

interface ProductFilters {
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

interface ProductResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      totalCount: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
  message?: string
}

interface SingleProductResponse {
  success: boolean
  data: Product
  message?: string
}

export function useProducts(businessSlug: string, filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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

      const data: ProductResponse = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [businessSlug, JSON.stringify(filters)])

  useEffect(() => {
    if (businessSlug) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [businessSlug, fetchProducts])

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts
  }
}

export function useProduct(businessSlug: string, productId: number | string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/businesses/${businessSlug}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`)
      }

      const data: SingleProductResponse = await response.json()
      
      if (data.success) {
        setProduct(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch product')
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }, [businessSlug, productId])

  useEffect(() => {
    if (businessSlug && productId) {
      fetchProduct()
    }
  }, [businessSlug, productId, fetchProduct])

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  }
}

export function useProductSearch(businessSlug: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = async (searchQuery: {
    q: string
    type?: 'text' | 'barcode' | 'sku'
    category?: number
    priceRange?: { min?: number; max?: number }
    inStock?: boolean
    limit?: number
    lang?: 'en' | 'sw'
    includeInactive?: boolean
  }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/businesses/${businessSlug}/products/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQuery)
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        return data.data.products
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (err) {
      console.error('Error searching products:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    searchProducts,
    loading,
    error
  }
} 