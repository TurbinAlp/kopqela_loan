import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth-config'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

// Validation schema
const createCategorySchema = z.object({
  businessId: z.number(),
  name: z.string().min(1, 'Category name is required'),
  nameSwahili: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable()
})

// GET - Fetch expense categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

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

    // Fetch categories
    const categories = await prisma.expenseCategory.findMany({
      where: {
        businessId: parseInt(businessId),
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: { categories }
    })

  } catch (error) {
    console.error('Error fetching expense categories:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expense categories' },
      { status: 500 }
    )
  }
}

// POST - Create new expense category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createCategorySchema.parse(body)

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

    // Check if category name already exists for this business
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        isActive: true
      }
    })

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 400 })
    }

    // Create category
    const category = await prisma.expenseCategory.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        nameSwahili: validatedData.nameSwahili,
        description: validatedData.description,
        color: validatedData.color
      }
    })

    return NextResponse.json({
      success: true,
      data: { category },
      message: 'Expense category created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating expense category:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create expense category' },
      { status: 500 }
    )
  }
}
