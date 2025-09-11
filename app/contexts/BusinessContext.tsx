'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useIsClient } from '../hooks/useIsClient'

interface PaymentMethod {
  value: string
  label: string
  labelSwahili?: string
  icon: string
}

interface Business {
  id: number
  name: string
  slug: string
  businessType: string
  createdAt: string
  userRole: string
  businessSetting?: {
    description?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    region?: string
    country?: string
    taxRate?: number
    paymentMethods?: PaymentMethod[]
  }
  _count?: {
    users: number
    employees: number
  }
}

interface BusinessContextType {
  currentBusiness: Business | null
  businesses: Business[]
  setCurrentBusiness: (business: Business | null) => void
  loadBusinesses: () => Promise<void>
  loadBusinessSettings: () => Promise<void>
  isLoading: boolean
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isClient = useIsClient()

  // Switch current business and save as default
  const setCurrentBusiness = async (business: Business | null) => {
    if (!business) return

    console.log('Switching to business:', business.name)
    setCurrentBusinessState(business)

    // Only access localStorage on client
    if (isClient) {
      localStorage.setItem('currentBusinessId', business.id.toString())
    }

    // Role is already available in business.userRole from the API
    // No need to make additional API call - use the role that's already loaded
    console.log('Business switched to:', business.name, 'Role:', business.userRole)

    // Save as default business preference
    try {
      await fetch('/api/admin/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'default_business',
          value: business.id.toString()
        })
      })
    } catch (error) {
      console.error('Error saving default business:', error)
    }
  }

  // Load business settings including taxRate
  const loadBusinessSettings = useCallback(async () => {
    if (!currentBusiness?.id) return
    
    try {
      const response = await fetch(`/api/admin/business/settings?businessId=${currentBusiness.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Update current business with settings from API
        setCurrentBusinessState(prev => prev ? {
          ...prev,
          businessSetting: {
            ...prev.businessSetting,
            taxRate: data.data.taxRate,
            paymentMethods: data.data.paymentMethods
          }
        } : null)
      }
    } catch (error) {
      console.error('Error loading business settings:', error)
    }
  }, [currentBusiness?.id])

  // Load user default business preference
  const loadDefaultBusiness = useCallback(async (userId: number, businesses: Business[]): Promise<Business | null> => {
    try {
      const response = await fetch('/api/admin/user/preferences?key=default_business')
      const data = await response.json()

      if (data.success && data.data && data.data.value) {
        const defaultBusinessId = parseInt(data.data.value)
        const defaultBusiness = businesses.find((b: Business) => b.id === defaultBusinessId)
        if (defaultBusiness) {
          return defaultBusiness
        }
      }
    } catch (error) {
      console.error('Error loading default business:', error)
    }
    return null
  }, [])

  // Load businesses from API
  const loadBusinesses = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/businesses')
      const data = await response.json()

      if (data.success && data.data) {
        setBusinesses(data.data)

        // Set default business if none selected
        if (!currentBusiness && data.data.length > 0) {
          let businessToSelect: Business | null = null

          // First, try to get user's default business from database
          try {
            const defaultBusiness = await loadDefaultBusiness(0, data.data) // userId will be validated in API
            if (defaultBusiness) {
              businessToSelect = defaultBusiness
            }
          } catch (error) {
            console.error('Error loading default business:', error)
          }

          // If no default business found, try localStorage (for backward compatibility)
          if (!businessToSelect && isClient) {
            const savedBusinessId = localStorage.getItem('currentBusinessId')
            if (savedBusinessId) {
              const savedBusiness = data.data.find((b: Business) => b.id === parseInt(savedBusinessId))
              if (savedBusiness) {
                businessToSelect = savedBusiness
              }
            }
          }

          // If still no business selected, use first business as fallback
          if (!businessToSelect) {
            businessToSelect = data.data[0]
          }

          if (businessToSelect) {
            setCurrentBusinessState(businessToSelect)
          }
        }
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness, isClient, loadDefaultBusiness])

  // Load businesses on mount
  useEffect(() => {
    loadBusinesses()
  }, [loadBusinesses])

  // Load business settings when currentBusiness changes
  useEffect(() => {
    if (currentBusiness?.id) {
      loadBusinessSettings()
    }
  }, [currentBusiness?.id, loadBusinessSettings])

  const value = {
    currentBusiness,
    businesses,
    setCurrentBusiness,
    loadBusinesses,
    loadBusinessSettings,
    isLoading
  }

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}

export type { PaymentMethod, Business }
export default BusinessContext 