import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '../../../../lib/rbac/middleware'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdInt = parseInt(businessId)

    // Calculate date ranges
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Parallel queries for better performance
    const [
      // Total sales (all time)
      totalSalesResult,
      
      // Today's sales
      todaysSalesResult,
      
      // Today's sales count
      todaysSalesCount,
      
      // Cash payments today
      todaysCashPayments,
      
      // Credit sales today
      todaysCreditSales,
      
      // Pending credit applications
      pendingCreditApps,
      
      // Low stock items (products list)
      lowStockProducts,
      
      // Outstanding debt
      outstandingDebt,
      
      // Pending payments
      pendingPayments
    ] = await Promise.all([
      // Total sales (all orders with PAID status)
      prisma.order.aggregate({
        where: {
          businessId: businessIdInt,
          paymentStatus: 'PAID'
        },
        _sum: {
          totalAmount: true
        }
      }),

      // Today's sales
      prisma.order.aggregate({
        where: {
          businessId: businessIdInt,
          paymentStatus: 'PAID',
          orderDate: {
            gte: startOfToday
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      // Today's sales count
      prisma.order.count({
        where: {
          businessId: businessIdInt,
          paymentStatus: 'PAID',
          orderDate: {
            gte: startOfToday
          }
        }
      }),

      // Cash payments today
      prisma.payment.aggregate({
        where: {
          businessId: businessIdInt,
          paymentMethod: 'CASH',
          paymentStatus: 'PAID',
          paidAt: {
            gte: startOfToday
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Credit sales today
      prisma.order.aggregate({
        where: {
          businessId: businessIdInt,
          paymentPlan: 'CREDIT',
          orderDate: {
            gte: startOfToday
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      // Pending credit applications (orders with CREDIT payment plan and PENDING status)
      prisma.order.count({
        where: {
          businessId: businessIdInt,
          paymentPlan: 'CREDIT',
          paymentStatus: 'PENDING'
        }
      }),

      // Low stock items (get products with inventory info)
      prisma.product.findMany({
        where: {
          businessId: businessIdInt,
          isActive: true
        },
        include: {
          inventory: true
        }
      }),

      // Outstanding debt (get all credit orders that are not fully paid)
      prisma.order.findMany({
        where: {
          businessId: businessIdInt,
          paymentPlan: 'CREDIT',
          paymentStatus: { not: 'PAID' }
        },
        include: {
          payments: {
            where: {
              paymentStatus: 'PAID'
            }
          }
        }
      }),

      // Pending payments (payments with PENDING status)
      prisma.payment.aggregate({
        where: {
          businessId: businessIdInt,
          paymentStatus: 'PENDING'
        },
        _sum: {
          amount: true
        }
      })
    ])

    // Calculate low stock items count
    const lowStockCount = lowStockProducts.filter((product: {
      inventory: { quantity: number; reorderPoint?: number | null }[]
    }) => {
      if (!product.inventory || product.inventory.length === 0) return false
      const inventory = product.inventory[0] // Assuming one inventory per product
      const reorderPoint = inventory.reorderPoint || 10 // Default minimum stock
      return inventory.quantity <= reorderPoint
    }).length

    // Calculate outstanding debt from credit orders
    const totalOutstandingDebt = outstandingDebt.reduce((sum: number, order) => {
      const totalPaid = order.payments.reduce((paidSum: number, payment) => {
        return paidSum + Number(payment.amount)
      }, 0)
      const remaining = Number(order.totalAmount) - totalPaid
      return sum + Math.max(0, remaining) // Only positive outstanding amounts
    }, 0)

    // Format the results
    const stats = {
      // Admin stats
      totalSales: (Number(totalSalesResult._sum.totalAmount) || 0).toLocaleString(),
      pendingCreditApps: pendingCreditApps.toString(),
      lowStock: lowStockCount.toString(),
      outstandingDebt: totalOutstandingDebt.toLocaleString(),
      
      // Cashier stats (today's data)
      todaysSales: (Number(todaysSalesResult._sum.totalAmount) || 0).toLocaleString(),
      salesCount: todaysSalesCount.toString(),
      cashPayments: (Number(todaysCashPayments._sum?.amount) || 0).toLocaleString(),
      creditSales: (Number(todaysCreditSales._sum.totalAmount) || 0).toLocaleString(),
      pendingPayments: (Number(pendingPayments._sum.amount) || 0).toLocaleString()
    }

    return NextResponse.json({
      success: true,
      data: {
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
