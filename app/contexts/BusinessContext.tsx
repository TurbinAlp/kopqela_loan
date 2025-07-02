'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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
    taxRate?: number
  }
  _count?: {
    users: number
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

  // Switch current business (localStorage only)
  const setCurrentBusiness = (business: Business | null) => {
    if (!business) return
    
    console.log('Switching to business:', business.name)
    setCurrentBusinessState(business)
    localStorage.setItem('currentBusinessId', business.id.toString())
  }

  // Load business settings including taxRate
  const loadBusinessSettings = useCallback(async () => {
    if (!currentBusiness?.id) return
    
    try {
      const response = await fetch(`/api/admin/business/settings?businessId=${currentBusiness.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Update current business with taxRate from settings
        setCurrentBusinessState(prev => prev ? {
          ...prev,
          businessSetting: {
            ...prev.businessSetting,
            taxRate: data.data.taxRate
          }
        } : null)
      }
    } catch (error) {
      console.error('Error loading business settings:', error)
    }
  }, [currentBusiness?.id])

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
          // Try to get from localStorage first
          const savedBusinessId = localStorage.getItem('currentBusinessId')
          if (savedBusinessId) {
            const savedBusiness = data.data.find((b: Business) => b.id === parseInt(savedBusinessId))
            if (savedBusiness) {
              setCurrentBusinessState(savedBusiness)
              return
            }
          }
          
          // Otherwise use first business as default
          setCurrentBusinessState(data.data[0])
        }
      }
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness])

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

export default BusinessContext 