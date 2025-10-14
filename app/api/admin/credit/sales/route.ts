import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'
import { checkFeatureAccess } from '../../../../lib/subscription/middleware'

/**
 * GET /api/admin/credit/sales
 * Get active credit sales (orders with CREDIT payment plan)
 */
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    // Check subscription feature access
    const featureCheck = await checkFeatureAccess(parseInt(businessId), 'enable_credit_sales')
    if (!featureCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: featureCheck.reason || 'Credit sales feature not available in your plan',
        data: {
          featureRequired: 'Credit Sales',
          requiredPlan: featureCheck.requiredPlan,
          currentPlan: featureCheck.planName,
          upgradeRequired: true
        }
      }, { status: 403 })
    }

    // Build where clause for credit sales
    const where: Record<string, any> = {
      businessId: parseInt(businessId),
      paymentPlan: 'CREDIT' // Only credit sales
    }

    if (status && status !== 'all') {
      where.status = status
    }
    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus
    }

    const creditSales = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameSwahili: true
              }
            }
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        },

      },
      orderBy: {
        orderDate: 'desc'
      },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.order.count({ where })

    // Transform data to match frontend interface
    const transformedSales = creditSales.map(sale => {
      const totalPaid = sale.payments
        .filter(p => p.paymentStatus === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0)
      
      const outstandingBalance = Number(sale.totalAmount) - totalPaid
      
      // Determine status based on payment status and balance
      let status = 'pending'
      if (outstandingBalance <= 0) {
        status = 'paid'
      } else if (totalPaid > 0) {
        status = 'partial'
      } else if (sale.paymentStatus === 'PENDING') {
        status = 'pending'
      }

      // Check if overdue (simple check - can be enhanced)
      const daysSinceOrder = Math.floor((new Date().getTime() - new Date(sale.orderDate).getTime()) / (1000 * 60 * 60 * 24))
      if (outstandingBalance > 0 && daysSinceOrder > 30) { // Assume 30 days is overdue
        status = 'overdue'
      }

      return {
        id: sale.id,
        saleNumber: sale.orderNumber,
        customerName: sale.customer.fullName,
        customerEmail: sale.customer.email || '',
        customerPhone: sale.customer.phone,
        products: sale.orderItems.map(item => ({
          name: item.product.name,
          category: 'General', // You might want to add category relation
          price: Number(item.unitPrice),
          quantity: item.quantity,
          total: Number(item.totalPrice)
        })),
        totalAmount: Number(sale.totalAmount),
        amountPaid: totalPaid,
        outstandingBalance,
        paymentPlan: sale.paymentPlan,
        paymentMethod: sale.paymentMethod,
        saleDate: sale.orderDate.toISOString().split('T')[0],
        dueDate: sale.deliveryDate ? sale.deliveryDate.toISOString().split('T')[0] : undefined,
        status,
        paymentStatus: sale.paymentStatus,
        lastPaymentDate: sale.payments.length > 0 ? sale.payments[0].paidAt?.toISOString().split('T')[0] : undefined,
        nextPaymentDate: undefined // Can be calculated based on payment plan
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sales: transformedSales,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })

  } catch (error) {
    console.error('Error fetching credit sales:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch credit sales',
      error: handlePrismaError(error)
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/credit/sales/analytics
 * Get credit sales analytics
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const body = await request.json()
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    // Get credit sales data
    const [activeSales, allCreditSales] = await Promise.all([
      // Active credit sales (orders with CREDIT payment plan)
      prisma.order.findMany({
        where: {
          businessId: parseInt(businessId),
          paymentPlan: 'CREDIT',
          paymentStatus: { not: 'PAID' }
        },
        include: {
          payments: true
        }
      }),

      // All credit sales for analytics
      prisma.order.findMany({
        where: {
          businessId: parseInt(businessId),
          paymentPlan: 'CREDIT'
        },
        include: {
          payments: true
        }
      })
    ])

    // Calculate analytics
    const totalOutstanding = activeSales.reduce((sum, sale) => {
      const totalPaid = sale.payments
        .filter(p => p.paymentStatus === 'PAID')
        .reduce((paidSum, p) => paidSum + Number(p.amount), 0)
      return sum + (Number(sale.totalAmount) - totalPaid)
    }, 0)

    const overdueSales = activeSales.filter(sale => {
      const now = new Date()
      const orderDate = new Date(sale.orderDate)
      const monthsSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const totalPaid = sale.payments
        .filter(p => p.paymentStatus === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0)
      const expectedPaid = (Number(sale.totalAmount) / 12) * monthsSinceOrder
      
      return totalPaid < expectedPaid * 0.7
    }).length

    const averageOrderValue = allCreditSales.length > 0 
      ? allCreditSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0) / allCreditSales.length 
      : 0

    const defaultedSales = allCreditSales.filter(sale => sale.paymentStatus === 'FAILED').length
    const defaultRate = allCreditSales.length > 0 ? (defaultedSales / allCreditSales.length) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalActiveSalesCount: activeSales.length,
        totalOutstanding,
        overdueSalesCount: overdueSales,
        averageOrderValue,
        defaultRate,
        collectionRate: 85.2 // This would need to be calculated based on actual payment data
      }
    })

  } catch (error) {
    console.error('Error fetching credit sales analytics:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch credit sales analytics',
      error: handlePrismaError(error)
    }, { status: 500 })
  }
}
