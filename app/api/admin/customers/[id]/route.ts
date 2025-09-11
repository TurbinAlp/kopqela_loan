import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { getAuthContext } from '../../../../lib/rbac/middleware'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id)

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    // Get auth context to validate business access
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch customer with related data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        business: true,
        user: true,
        orders: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            payments: true
          },
          orderBy: { orderDate: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        creditApplications: {
          orderBy: { applicationDate: 'desc' }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate that user has access to this customer's business
    const hasBusinessAccess = await prisma.business.findFirst({
      where: {
        id: customer.businessId,
        OR: [
          { ownerId: authContext.userId },
          {
            employees: {
              some: {
                userId: authContext.userId,
                isActive: true,
                isDeleted: false
              }
            }
          }
        ]
      }
    })

    if (!hasBusinessAccess) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this customer' },
        { status: 403 }
      )
    }

    // Transform data to match frontend interface
    const transformedCustomer = {
      id: customer.id,
      name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: null, // Not in current schema
      status: customer.isActive ? 'active' : 'suspended',
      registrationDate: customer.joinDate.toISOString().split('T')[0],
      lastOrderDate: customer.orders.length > 0 
        ? customer.orders[0].orderDate.toISOString().split('T')[0] 
        : null,
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum: number, order) => sum + Number(order.totalAmount), 0),
      creditLimit: Number(customer.creditLimit || 0),
      outstandingBalance: customer.payments
        .filter((payment) => payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'FAILED')
        .reduce((sum: number, payment) => sum + Number(payment.amount), 0),
      creditScore: calculateCreditScore(customer),
      idNumber: null, // Not in current schema
      dateOfBirth: null, // Not in current schema  
      occupation: null, // Not in current schema
      customerNotes: customer.notes
    }

    // Transform orders
    const transformedOrders = customer.orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      date: order.orderDate.toISOString().split('T')[0],
      items: order.orderItems.length,
      total: Number(order.totalAmount),
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      paymentMethod: order.paymentMethod.toLowerCase(),
      dueDate: order.deliveryDate?.toISOString().split('T')[0]
    }))

    // Transform payments
    const transformedPayments = customer.payments.map(payment => ({
      id: payment.id,
      date: payment.createdAt.toISOString().split('T')[0],
      amount: Number(payment.amount),
      method: payment.paymentMethod.toLowerCase(),
      orderNumber: payment.reference || '',
      status: payment.paymentStatus.toLowerCase()
    }))

    // Transform credit history from credit applications
    const transformedCreditHistory = customer.creditApplications.map(app => ({
      id: app.id,
      date: app.applicationDate.toISOString().split('T')[0],
      type: app.status === 'APPROVED' ? 'loan_granted' : 'loan_applied',
      amount: Number(app.requestedAmount),
      description: `Credit application for ${app.customerType} customer`,
      balance: Number(app.approvedAmount || 0)
    }))

    return NextResponse.json({
      success: true,
      data: {
        customer: transformedCustomer,
        orders: transformedOrders,
        payments: transformedPayments,
        creditHistory: transformedCreditHistory
      }
    })

  } catch (error) {
    console.error('Error fetching customer details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = parseInt(params.id)
    const body = await request.json()
    const { name, email, phone, address, idNumber, dateOfBirth, occupation, creditLimit, status, customerNotes } = body

    // Get auth context to validate business access
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First fetch the customer to validate business access
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { businessId: true }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validate that user has access to this customer's business
    const hasBusinessAccess = await prisma.business.findFirst({
      where: {
        id: existingCustomer.businessId,
        OR: [
          { ownerId: authContext.userId },
          {
            employees: {
              some: {
                userId: authContext.userId,
                isActive: true,
                isDeleted: false
              }
            }
          }
        ]
      }
    })

    if (!hasBusinessAccess) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this customer' },
        { status: 403 }
      )
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName: name,
        email: email || null,
        phone,
        address: address || null,
        idNumber: idNumber || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        occupation: occupation || null,
        notes: customerNotes || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : 0,
        isActive: status === 'active'
      }
    })

    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

// Helper function to calculate credit score
function calculateCreditScore(customer: {
  orders: Array<{ totalAmount: Decimal }>
  payments: Array<{ paymentStatus: string; amount: Decimal }>
}): 'excellent' | 'good' | 'fair' | 'poor' {
  const totalOrders = customer.orders.length
  const totalSpent = customer.orders.reduce((sum: number, order) => sum + Number(order.totalAmount), 0)
  const outstandingBalance = customer.payments
    .filter((payment) => payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'FAILED')
    .reduce((sum: number, payment) => sum + Number(payment.amount), 0)

  if (outstandingBalance === 0 && totalOrders > 10 && totalSpent > 1000000) {
    return 'excellent'
  } else if (outstandingBalance < totalSpent * 0.1 && totalOrders > 5) {
    return 'good'
  } else if (outstandingBalance < totalSpent * 0.3) {
    return 'fair'
  } else {
    return 'poor'
  }
} 