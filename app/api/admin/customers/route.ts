import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'fullName'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Build where clause for filtering
    const where: Prisma.CustomerWhereInput = {
      businessId: parseInt(businessId),
    }

    // Add search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add status filter
    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // Build orderBy clause
    const sortDirection = sortOrder === 'desc' ? 'desc' : 'asc'
    let orderBy: Prisma.CustomerOrderByWithRelationInput = {}
    
    switch (sortBy) {
      case 'joinDate':
        orderBy = { joinDate: sortDirection }
        break
      case 'fullName':
        orderBy = { fullName: sortDirection }
        break
      case 'totalSpent':
        // This will be calculated in the select, fallback to name for now
        orderBy = { fullName: sortDirection }
        break
      case 'outstandingBalance':
        // This will be calculated in the select, fallback to name for now
        orderBy = { fullName: sortDirection }
        break
      default:
        orderBy = { fullName: sortDirection }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Fetch customers with related data
    const customers = await prisma.customer.findMany({
      where,
      include: {
        user: true,
        orders: {
          include: {
            orderItems: true,
            payments: true
          }
        },
        payments: true,
        creditApplications: true
      },
      orderBy,
      skip: offset,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.customer.count({ where })

    // Transform data to match the frontend interface
    const transformedCustomers = customers.map(customer => {
      // Calculate total orders and total spent
      const totalOrders = customer.orders.length
      const totalSpent = customer.orders.reduce((sum, order) => {
        return sum + Number(order.totalAmount)
      }, 0)

      // Calculate outstanding balance from unpaid payments and credit applications
      const outstandingBalance = customer.payments
        .filter(payment => payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'FAILED')
        .reduce((sum, payment) => sum + Number(payment.amount), 0)

      // Get last order date
      const lastOrderDate = customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0].orderDate
        : null

      // Calculate credit score based on payment history and outstanding balance
      let creditScore: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'
      if (outstandingBalance === 0 && totalOrders > 10) {
        creditScore = 'excellent'
      } else if (outstandingBalance < totalSpent * 0.1 && totalOrders > 5) {
        creditScore = 'good'
      } else if (outstandingBalance > totalSpent * 0.5) {
        creditScore = 'poor'
      }

      // Determine status based on isActive and recent activity
      let status: 'active' | 'inactive' | 'suspended' = customer.isActive ? 'active' : 'suspended'
      if (customer.isActive && (!lastOrderDate || new Date(lastOrderDate) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))) {
        status = 'inactive'
      }

      return {
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: null, // Not in current schema, can be added later
        status,
        registrationDate: customer.joinDate.toISOString().split('T')[0],
        lastOrderDate: lastOrderDate?.toISOString().split('T')[0],
        totalOrders,
        totalSpent,
        creditLimit: Number(customer.creditLimit || 0),
        outstandingBalance,
        creditScore
      }
    })

    // Calculate summary statistics
    const totalCustomers = await prisma.customer.count({
      where: { businessId: parseInt(businessId) }
    })
    
    const activeCustomers = await prisma.customer.count({
      where: { 
        businessId: parseInt(businessId),
        isActive: true
      }
    })

    const allCustomersWithOrders = await prisma.customer.findMany({
      where: { businessId: parseInt(businessId) },
      include: {
        orders: true,
        payments: {
          where: {
            OR: [
              { paymentStatus: 'PENDING' },
              { paymentStatus: 'FAILED' }
            ]
          }
        }
      }
    })

    const totalOutstanding = allCustomersWithOrders.reduce((sum, customer) => {
      return sum + customer.payments.reduce((paymentSum, payment) => {
        return paymentSum + Number(payment.amount)
      }, 0)
    }, 0)

    const totalSpentSum = allCustomersWithOrders.reduce((sum, customer) => {
      return sum + customer.orders.reduce((orderSum, order) => {
        return orderSum + Number(order.totalAmount)
      }, 0)
    }, 0)

    const averageSpent = totalCustomers > 0 ? totalSpentSum / totalCustomers : 0

    return NextResponse.json({
      success: true,
      data: {
        customers: transformedCustomers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit
        },
        summary: {
          totalCustomers,
          activeCustomers,
          totalOutstanding,
          averageSpent
        }
      }
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 