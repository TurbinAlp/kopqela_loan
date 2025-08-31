'use client'

import { useDataCache, invalidateDataCache } from './useDataCache'

// Customer interfaces
export interface Customer {
  id: number
  fullName: string
  email?: string
  phone: string
  address?: string
  businessId: number
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  creditLimit?: number
  outstandingDebt?: number
  createdAt: string
  updatedAt: string
}

export interface CustomersData {
  customers: Customer[]
  totalCount: number
  activeCustomers: number
  newCustomersThisMonth: number
  topCustomers: Customer[]
}

// Customers data fetcher
const fetchCustomersData = async (businessId?: number): Promise<CustomersData> => {
  if (!businessId) {
    throw new Error('Business ID is required')
  }

  // Fetch customers data
  const customersResponse = await fetch(`/api/admin/customers?businessId=${businessId}&includeStats=true`)

  if (!customersResponse.ok) {
    throw new Error('Failed to fetch customers')
  }

  const customersData = await customersResponse.json()

  if (!customersData.success) {
    throw new Error(customersData.message || 'Failed to fetch customers')
  }

  const customers: Customer[] = customersData.data.customers || []
  
  // Calculate metrics
  const totalCount = customers.length
  const activeCustomers = customers.filter(c => c.lastOrderDate && 
    new Date(c.lastOrderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  ).length
  
  const thisMonth = new Date()
  thisMonth.setDate(1) // First day of current month
  const newCustomersThisMonth = customers.filter(c => 
    new Date(c.createdAt) >= thisMonth
  ).length
  
  // Top customers by total spent
  const topCustomers = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)

  return {
    customers,
    totalCount,
    activeCustomers,
    newCustomersThisMonth,
    topCustomers
  }
}

// Custom hook for customers data
export function useCustomersData(businessId?: number, enabled: boolean = true) {
  return useDataCache<CustomersData>(
    'customers',
    fetchCustomersData,
    businessId,
    enabled
  )
}

// Cache invalidation utilities for customers
export const CustomersCacheInvalidator = {
  // Invalidate when customer is created/updated/deleted
  onCustomerChanged: (businessId: number) => {
    invalidateDataCache('customers', businessId)
  },

  // Invalidate when customer makes an order (affects stats)
  onCustomerOrderPlaced: (businessId: number) => {
    invalidateDataCache('customers', businessId)
    // Also invalidate orders cache
    invalidateDataCache('orders', businessId)
  },

  // Invalidate when payment is received (affects debt/spent amounts)
  onCustomerPaymentReceived: (businessId: number) => {
    invalidateDataCache('customers', businessId)
  },

  // Clear all customers cache
  invalidateAll: (businessId?: number) => {
    invalidateDataCache('customers', businessId)
  }
}
