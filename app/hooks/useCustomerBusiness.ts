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
    // Why Choose Us Features
    feature1Title?: string
    feature1TitleSwahili?: string
    feature1Description?: string
    feature1DescriptionSwahili?: string
    feature1Icon?: string
    feature2Title?: string
    feature2TitleSwahili?: string
    feature2Description?: string
    feature2DescriptionSwahili?: string
    feature2Icon?: string
    feature3Title?: string
    feature3TitleSwahili?: string
    feature3Description?: string
    feature3DescriptionSwahili?: string
    feature3Icon?: string
    feature4Title?: string
    feature4TitleSwahili?: string
    feature4Description?: string
    feature4DescriptionSwahili?: string
    feature4Icon?: string
    // Business Operations
    businessHours?: Array<{day: string, open: string, close: string, isOpen: boolean}>
    paymentMethods?: string[]
    deliveryAreas?: string[]
    deliveryFee?: number
    freeDeliveryMinimum?: number
    estimatedDeliveryTime?: string
    // Display Settings
    showAboutSection?: boolean
    // Credit Terms Settings
    creditTerms?: Array<{
      months: number
      interestRate: number
      isPopular: boolean
      enabled: boolean
    }>
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