'use client'

import { useDataCache, invalidateDataCache } from './useDataCache'

// Order interfaces
export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  orderNumber: string
  customerId?: number
  customerName: string
  customerPhone?: string
  items: OrderItem[]
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  paymentMethod?: string
  orderDate: string
  dueDate?: string
  businessId: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrdersData {
  orders: Order[]
  totalCount: number
  pendingOrders: number
  paidOrders: number
  overdueOrders: number
  todaysOrders: number
  totalSales: number
  todaysSales: number
  recentOrders: Order[]
}

// Orders data fetcher
const fetchOrdersData = async (businessId?: number): Promise<OrdersData> => {
  if (!businessId) {
    throw new Error('Business ID is required')
  }

  // Fetch orders with stats
  const ordersResponse = await fetch(`/api/admin/sales/orders?businessId=${businessId}&includeStats=true&limit=100`)

  if (!ordersResponse.ok) {
    throw new Error('Failed to fetch orders')
  }

  const ordersData = await ordersResponse.json()

  if (!ordersData.success) {
    throw new Error(ordersData.message || 'Failed to fetch orders')
  }

  const orders: Order[] = ordersData.data.orders || []
  
  // Calculate metrics
  const totalCount = orders.length
  const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING').length
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID').length
  const overdueOrders = orders.filter(o => o.paymentStatus === 'OVERDUE').length
  
  // Today's orders
  const today = new Date().toISOString().split('T')[0]
  const todaysOrdersList = orders.filter(o => 
    o.orderDate.startsWith(today)
  )
  const todaysOrders = todaysOrdersList.length
  
  // Sales calculations
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const todaysSales = todaysOrdersList.reduce((sum, order) => sum + order.totalAmount, 0)
  
  // Recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return {
    orders,
    totalCount,
    pendingOrders,
    paidOrders,
    overdueOrders,
    todaysOrders,
    totalSales,
    todaysSales,
    recentOrders
  }
}

// Custom hook for orders data
export function useOrdersData(businessId?: number, enabled: boolean = true) {
  return useDataCache<OrdersData>(
    'orders',
    fetchOrdersData,
    businessId,
    enabled
  )
}

// Cache invalidation utilities for orders
export const OrdersCacheInvalidator = {
  // Invalidate when order is created/updated/deleted
  onOrderChanged: (businessId: number) => {
    invalidateDataCache('orders', businessId)
  },

  // Invalidate when payment is received
  onPaymentReceived: (businessId: number) => {
    invalidateDataCache('orders', businessId)
    // Also invalidate customers cache (affects customer stats)
    invalidateDataCache('customers', businessId)
  },

  // Invalidate when order status changes
  onOrderStatusChanged: (businessId: number) => {
    invalidateDataCache('orders', businessId)
  },

  // Clear all orders cache
  invalidateAll: (businessId?: number) => {
    invalidateDataCache('orders', businessId)
  }
}
