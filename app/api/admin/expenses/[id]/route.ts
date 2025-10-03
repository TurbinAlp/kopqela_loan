import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth-config'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

// Validation schema for updating expense
const updateExpenseSchema = z.object({
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

// GET - Fetch single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const expenseId = parseInt(params.id)
    if (isNaN(expenseId)) {
      return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
    }

    // Fetch expense with relations
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
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
        },
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!expense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    // Verify user has access to this business
    const businessAccess = await prisma.businessUser.findFirst({
      where: {
        businessId: expense.businessId,
        userId: parseInt(session.user.id.toString()),
        isActive: true,
        isDeleted: false
      }
    })

    if (!businessAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

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
      business: expense.business,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: { expense: transformedExpense }
    })

  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

// PUT - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const expenseId = parseInt(params.id)
    if (isNaN(expenseId)) {
      return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = updateExpenseSchema.parse(body)

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId }
    })

    if (!existingExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

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

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
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
        nextDueDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null
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
      id: updatedExpense.id,
      expenseNumber: updatedExpense.expenseNumber,
      title: updatedExpense.title,
      description: updatedExpense.description,
      amount: Number(updatedExpense.amount),
      expenseDate: updatedExpense.expenseDate.toISOString(),
      paymentMethod: updatedExpense.paymentMethod,
      status: updatedExpense.status,
      receipt: updatedExpense.receipt,
      reference: updatedExpense.reference,
      vendorName: updatedExpense.vendorName,
      vendorContact: updatedExpense.vendorContact,
      isRecurring: updatedExpense.isRecurring,
      recurringType: updatedExpense.recurringType,
      nextDueDate: updatedExpense.nextDueDate?.toISOString(),
      categoryId: updatedExpense.categoryId,
      category: updatedExpense.category,
      createdBy: updatedExpense.createdBy,
      createdAt: updatedExpense.createdAt.toISOString(),
      updatedAt: updatedExpense.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: { expense: transformedExpense },
      message: 'Expense updated successfully'
    })

  } catch (error) {
    console.error('Error updating expense:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const expenseId = parseInt(params.id)
    if (isNaN(expenseId)) {
      return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
    }

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!existingExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    // Verify user has access to this business
    const businessAccess = await prisma.businessUser.findFirst({
      where: {
        businessId: existingExpense.businessId,
        userId: parseInt(session.user.id.toString()),
        isActive: true,
        isDeleted: false
      }
    })

    if (!businessAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: expenseId }
    })

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
