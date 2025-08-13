import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'

/**
 * GET /api/admin/credit/payments
 * Get payment history for credit sales
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

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    // Build where clause for payments related to credit sales
    const whereConditions: Record<string, unknown> = {
      businessId: parseInt(businessId),
      order: {
        paymentPlan: {
          in: ['CREDIT', 'PARTIAL']
        }
      }
    }

    if (status && status !== 'all') {
      whereConditions.paymentStatus = status.toUpperCase()
    }

    const payments = await prisma.payment.findMany({
      where: whereConditions,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            paymentPlan: true
          }
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.payment.count({ where: whereConditions })

    // Transform data to match frontend interface
    const transformedPayments = payments.map(payment => {
      // Calculate balance after this payment
      const balanceAfter = payment.order ? Number(payment.order.totalAmount) - Number(payment.amount) : 0

      return {
        id: payment.id,
        saleId: payment.orderId || 0,
        saleNumber: payment.order?.orderNumber || payment.reference || 'N/A',
        customerName: payment.customer.fullName,
        paymentDate: payment.paidAt ? payment.paidAt.toISOString().split('T')[0] : payment.createdAt.toISOString().split('T')[0],
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod as string,
        paymentType: (Number(payment.amount) === Number(payment.order?.totalAmount) ? 'FULL_PAYMENT' : 'INSTALLMENT') as 'DOWN_PAYMENT' | 'INSTALLMENT' | 'FULL_PAYMENT',
        balanceAfter: Math.max(0, balanceAfter),
        status: payment.paymentStatus === 'PAID' ? 'COMPLETED' : payment.paymentStatus as 'COMPLETED' | 'PENDING' | 'FAILED',
        reference: payment.reference || undefined,
        notes: payment.notes || undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        payments: transformedPayments,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })

  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch payment history',
      error: handlePrismaError(error)
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/credit/payments
 * Record a new payment for a credit sale
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
    const { 
      orderId, 
      customerId, 
      businessId, 
      amount, 
      paymentMethod, 
      reference, 
      notes 
    } = body

    // Validate required fields
    if (!orderId || !customerId || !businessId || !amount || !paymentMethod) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Get the order to validate and update
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        payments: true
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 })
    }

    // Calculate total paid so far
    const totalPaid = order.payments
      .filter(p => p.paymentStatus === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const newTotalPaid = totalPaid + Number(amount)
    const orderTotal = Number(order.totalAmount)

    // Validate payment amount
    if (newTotalPaid > orderTotal) {
      return NextResponse.json({
        success: false,
        message: 'Payment amount exceeds remaining balance'
      }, { status: 400 })
    }

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        businessId: parseInt(businessId),
        orderId: parseInt(orderId),
        customerId: parseInt(customerId),
        amount: Number(amount),
        paymentMethod,
        paymentStatus: 'PAID',
        reference,
        notes,
        paidAt: new Date()
      }
    })

    // Update order payment status
    let newPaymentStatus = 'PARTIAL'
    if (newTotalPaid >= orderTotal) {
      newPaymentStatus = 'PAID'
    }

    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: newPaymentStatus as 'PARTIAL' | 'PAID'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    })

  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to record payment',
      error: handlePrismaError(error)
    }, { status: 500 })
  }
}
