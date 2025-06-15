'use client'

import { useState, useEffect } from 'react'

interface Store {
  id: string
  slug: string
  name: string
  description: string
  logo: string | null
  primaryColor: string
  secondaryColor: string
  contactPhone: string
  contactEmail: string
  address: string
  businessType: string
  status: 'active'
  deliveryAreas: string[]
  paymentMethods: string[]
  workingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean }
  }
  settings: {
    allowCredit: boolean
    allowPartialPayment: boolean
    minimumOrderAmount: number
    deliveryFee: number
    taxRate: number
  }
  _count: {
    products: number
    categories: number
    orders: number
  }
}

export function useStores(searchQuery?: string, selectedCategory?: string) {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        if (searchQuery?.trim()) params.append('search', searchQuery.trim())
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }

        const response = await fetch(`/api/stores?${params}`)
        const data = await response.json()

        if (data.success) {
          setStores(data.data)
        } else {
          setError(data.message || 'Failed to load stores')
          setStores([])
        }
      } catch (err) {
        console.error('Error fetching stores:', err)
        setError('Failed to load stores')
        setStores([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search query
    const timeoutId = setTimeout(fetchStores, searchQuery ? 500 : 0)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory])

  return {
    stores,
    isLoading,
    error
  }
} 