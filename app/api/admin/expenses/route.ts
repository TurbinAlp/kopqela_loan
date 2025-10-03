import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth-config'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

// Validation schemas
const createExpenseSchema = z.object({
  businessId: z.number(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  expenseDate: z.string(),
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  categoryId: z.number().optional().nullable(),
  vendorName: z.string().optional().nullable(),
  vendorContact: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringType: z.string().optional().nullable(),
  nextDueDate: z.string().optional().nullable()
})

// GET - Fetch expenses with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const paymentMethod = searchParams.get('paymentMethod')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const isRecurring = searchParams.get('isRecurring')
    const sortBy = searchParams.get('sortBy') || 'expenseDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!businessId) {
      return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 })
    }

    // Verify user has access to this business
    const businessAccess = await prisma.businessUser.findFirst({
      where: {
        businessId: parseInt(businessId),
        userId: parseInt(session.user.id.toString()),
        isActive: true,
        isDeleted: false
      }
    })

    if (!businessAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // Build where clause
    const where: any = {
      businessId: parseInt(businessId)
    }

    // Apply filters
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vendorName: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { expenseNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = paymentMethod as 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'
    }

    if (status && status !== 'all') {
      where.status = status as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId)
    }

    if (dateFrom) {
      where.expenseDate = {
        ...where.expenseDate,
        gte: new Date(dateFrom)
      }
    }

    if (dateTo) {
      where.expenseDate = {
        ...where.expenseDate,
        lte: new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (isRecurring && isRecurring !== 'all') {
      where.isRecurring = isRecurring === 'true'
    }

    // Build orderBy clause
    const orderBy: any = {}
    
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else if (sortBy === 'paymentMethod') {
      orderBy.paymentMethod = sortOrder
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else {
      orderBy.expenseDate = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch expenses with relations
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameSwahili: true,
              color: true
            }
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ])

    // Transform data for response
    const transformedExpenses = expenses.map(expense => ({
      id: expense.id,
      expenseNumber: expense.expenseNumber,
      title: expense.title,
      description: expense.description,
      amount: Number(expense.amount),
      expenseDate: expense.expenseDate.toISOString(),
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      receipt: expense.receipt,
      reference: expense.reference,
      vendorName: expense.vendorName,
      vendorContact: expense.vendorContact,
      isRecurring: expense.isRecurring,
      recurringType: expense.recurringType,
      nextDueDate: expense.nextDueDate?.toISOString(),
      categoryId: expense.categoryId,
      category: expense.category,
      createdBy: expense.createdBy,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        expenses: transformedExpenses,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createExpenseSchema.parse(body)

    // Verify user has access to this business
    const businessAccess = await prisma.businessUser.findFirst({
      where: {
        businessId: validatedData.businessId,
        userId: parseInt(session.user.id.toString()),
        isActive: true,
        isDeleted: false
      }
    })

    if (!businessAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // Generate expense number
    const expenseCount = await prisma.expense.count({
      where: { businessId: validatedData.businessId }
    })
    const expenseNumber = `EXP-${String(expenseCount + 1).padStart(6, '0')}`

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        businessId: validatedData.businessId,
        title: validatedData.title,
        description: validatedData.description,
        amount: validatedData.amount,
        expenseDate: new Date(validatedData.expenseDate),
        paymentMethod: validatedData.paymentMethod,
        status: validatedData.status,
        categoryId: validatedData.categoryId,
        vendorName: validatedData.vendorName,
        vendorContact: validatedData.vendorContact,
        reference: validatedData.reference,
        isRecurring: validatedData.isRecurring,
        recurringType: validatedData.recurringType,
        nextDueDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null,
        createdById: parseInt(session.user.id.toString())
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameSwahili: true,
            color: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Transform response
    const transformedExpense = {
      id: expense.id,
      expenseNumber: expense.expenseNumber,
      title: expense.title,
      description: expense.description,
      amount: Number(expense.amount),
      expenseDate: expense.expenseDate.toISOString(),
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      receipt: expense.receipt,
      reference: expense.reference,
      vendorName: expense.vendorName,
      vendorContact: expense.vendorContact,
      isRecurring: expense.isRecurring,
      recurringType: expense.recurringType,
      nextDueDate: expense.nextDueDate?.toISOString(),
      categoryId: expense.categoryId,
      category: expense.category,
      createdBy: expense.createdBy,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: { expense: transformedExpense },
      message: 'Expense created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating expense:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
