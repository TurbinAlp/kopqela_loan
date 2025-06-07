'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useParams } from 'next/navigation'

interface Business {
  id: string
  slug: string
  name: string
  description: string
  logo: string
  primaryColor: string
  secondaryColor: string
  contactPhone: string
  contactEmail: string
  address: string
  businessType: string
  status: 'active' | 'inactive'
  deliveryAreas: string[]
  paymentMethods: string[]
  workingHours: {
    monday: { open: string; close: string; isOpen: boolean }
    tuesday: { open: string; close: string; isOpen: boolean }
    wednesday: { open: string; close: string; isOpen: boolean }
    thursday: { open: string; close: string; isOpen: boolean }
    friday: { open: string; close: string; isOpen: boolean }
    saturday: { open: string; close: string; isOpen: boolean }
    sunday: { open: string; close: string; isOpen: boolean }
  }
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    whatsapp?: string
  }
  settings: {
    allowCredit: boolean
    allowPartialPayment: boolean
    minimumOrderAmount: number
    deliveryFee: number
    taxRate: number
  }
}

interface BusinessContextType {
  business: Business | null
  loading: boolean
  error: string | null
  refreshBusiness: () => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

// Sample businesses for development
const SAMPLE_BUSINESSES: Record<string, Business> = {
  'duka-la-mama': {
    id: '1',
    slug: 'duka-la-mama',
    name: 'Duka la Mama',
    description: 'Your neighborhood store for all your daily needs',
    logo: '/images/stores/duka-la-mama-logo.png',
    primaryColor: '#059669', // emerald-600
    secondaryColor: '#10b981', // emerald-500
    contactPhone: '+255 123 456 789',
    contactEmail: 'info@dukalamama.co.tz',
    address: 'Kariakoo, Dar es Salaam',
    businessType: 'General Store',
    status: 'active',
    deliveryAreas: ['Kariakoo', 'Ilala', 'Kinondoni'],
    paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer'],
    workingHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: true }
    },
    socialMedia: {
      whatsapp: '+255123456789',
      facebook: 'dukalamama'
    },
    settings: {
      allowCredit: true,
      allowPartialPayment: true,
      minimumOrderAmount: 5000,
      deliveryFee: 2000,
      taxRate: 0.18
    }
  },
  'electronics-store': {
    id: '2',
    slug: 'electronics-store',
    name: 'TechHub Electronics',
    description: 'Latest electronics and gadgets at affordable prices',
    logo: '/images/stores/techhub-logo.png',
    primaryColor: '#1e40af', // blue-800
    secondaryColor: '#3b82f6', // blue-500
    contactPhone: '+255 987 654 321',
    contactEmail: 'info@techhub.co.tz',
    address: 'Mlimani City, Dar es Salaam',
    businessType: 'Electronics',
    status: 'active',
    deliveryAreas: ['Dar es Salaam', 'Dodoma', 'Arusha'],
    paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card'],
    workingHours: {
      monday: { open: '09:00', close: '19:00', isOpen: true },
      tuesday: { open: '09:00', close: '19:00', isOpen: true },
      wednesday: { open: '09:00', close: '19:00', isOpen: true },
      thursday: { open: '09:00', close: '19:00', isOpen: true },
      friday: { open: '09:00', close: '19:00', isOpen: true },
      saturday: { open: '09:00', close: '17:00', isOpen: true },
      sunday: { open: '12:00', close: '16:00', isOpen: true }
    },
    socialMedia: {
      facebook: 'techhubtz',
      instagram: 'techhub_tz',
      whatsapp: '+255987654321'
    },
    settings: {
      allowCredit: false,
      allowPartialPayment: true,
      minimumOrderAmount: 10000,
      deliveryFee: 3000,
      taxRate: 0.18
    }
  },
  'fashion-boutique': {
    id: '3',
    slug: 'fashion-boutique',
    name: 'Elegance Fashion',
    description: 'Trendy fashion for the modern African woman',
    logo: '/images/stores/elegance-logo.png',
    primaryColor: '#be185d', // pink-700
    secondaryColor: '#ec4899', // pink-500
    contactPhone: '+255 555 123 456',
    contactEmail: 'hello@elegancefashion.co.tz',
    address: 'Masaki, Dar es Salaam',
    businessType: 'Fashion & Clothing',
    status: 'active',
    deliveryAreas: ['Masaki', 'Oyster Bay', 'Msasani'],
    paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer'],
    workingHours: {
      monday: { open: '10:00', close: '20:00', isOpen: true },
      tuesday: { open: '10:00', close: '20:00', isOpen: true },
      wednesday: { open: '10:00', close: '20:00', isOpen: true },
      thursday: { open: '10:00', close: '20:00', isOpen: true },
      friday: { open: '10:00', close: '20:00', isOpen: true },
      saturday: { open: '10:00', close: '18:00', isOpen: true },
      sunday: { open: '14:00', close: '18:00', isOpen: true }
    },
    socialMedia: {
      instagram: 'elegance_fashion_tz',
      facebook: 'elegancefashiontz',
      whatsapp: '+255555123456'
    },
    settings: {
      allowCredit: true,
      allowPartialPayment: false,
      minimumOrderAmount: 15000,
      deliveryFee: 2500,
      taxRate: 0.18
    }
  }
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const slug = params?.slug as string
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBusiness = async () => {
    if (!slug) {
      setError('Business slug not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // In production, this would be an API call
      // const response = await fetch(`/api/businesses/${slug}`)
      // const businessData = await response.json()
      
      // For now, use sample data
      const businessData = SAMPLE_BUSINESSES[slug]
      
      if (!businessData) {
        setError('Business not found')
        setBusiness(null)
      } else if (businessData.status !== 'active') {
        setError('Business is currently inactive')
        setBusiness(null)
      } else {
        setBusiness(businessData)
      }
    } catch (error) {
      console.error('Error loading business:', error)
      setError('Failed to load business information')
      setBusiness(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusiness()
  }, [slug])

  const refreshBusiness = () => {
    loadBusiness()
  }

  return (
    <BusinessContext.Provider value={{ business, loading, error, refreshBusiness }}>
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