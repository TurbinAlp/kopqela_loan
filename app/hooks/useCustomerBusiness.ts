'use client'

import { useState, useEffect } from 'react'

interface Business {
  id: number
  name: string
  slug: string
  businessType: string
  createdAt: string
  businessSetting?: {
    description?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    region?: string
    country?: string
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
    enableCreditSales?: boolean
    taxRate?: number
  }
  _count?: {
    products: number
    categories: number
    orders: number
  }
}

export function useCustomerBusiness(slug: string) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setIsLoading(false)
      return
    }

    const fetchBusiness = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/businesses/${slug}`)
        const data = await response.json()

        if (data.success) {
          setBusiness(data.data)
        } else {
          setError(data.message || 'Business not found')
          setBusiness(null)
        }
      } catch (err) {
        console.error('Error fetching business:', err)
        setError('Failed to load business')
        setBusiness(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusiness()
  }, [slug])

  return {
    business,
    isLoading,
    error
  }
} 