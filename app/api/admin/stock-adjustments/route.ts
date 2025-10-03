import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth-config'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

// Validation schema for creating stock adjustment
const createStockAdjustmentSchema = z.object({
  businessId: z.number(),
  productId: z.number(),
  storeId: z.number().optional().nullable(),
  adjustmentType: z.enum(['DAMAGE', 'EXPIRED', 'THEFT', 'LOST', 'QUALITY_ISSUE', 'BREAKAGE', 'SPOILAGE', 'RETURN_TO_SUPPLIER', 'OTHER']),
  quantity: z.number().positive('Quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  adjustmentDate: z.string().optional()
})

// GET - Fetch stock adjustments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = parseInt(searchParams.get('businessId') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const productId = searchParams.get('productId')
    const adjustmentType = searchParams.get('adjustmentType')
    const storeId = searchParams.get('storeId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    if (!businessId) {
      return NextResponse.json({ success: false, message: 'Business ID is required' }, { status: 400 })
    }

    // Verify user has access to this business
    const businessAccess = await prisma.businessUser.findFirst({
      where: {
        businessId,
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
      businessId
    }

    if (productId) {
      where.productId = parseInt(productId)
    }

    if (adjustmentType && adjustmentType !== 'all') {
      where.adjustmentType = adjustmentType
    }

    if (storeId && storeId !== 'all') {
      where.storeId = parseInt(storeId)
    }

    if (dateFrom || dateTo) {
      where.adjustmentDate = {}
      if (dateFrom) {
        where.adjustmentDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.adjustmentDate.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (search) {
      where.OR = [
        {
          reason: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          notes: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          referenceNumber: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          product: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Get total count
    const totalCount = await prisma.stockAdjustment.count({ where })

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Fetch adjustments
    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameSwahili: true,
            sku: true,
            unit: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            nameSwahili: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        adjustmentDate: 'desc'
      },
      skip,
      take: limit
    })

    // Transform response
    const transformedAdjustments = adjustments.map(adjustment => ({
      id: adjustment.id,
      productId: adjustment.productId,
      storeId: adjustment.storeId,
      adjustmentType: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      unitCost: Number(adjustment.unitCost),
      totalCost: Number(adjustment.totalCost),
      reason: adjustment.reason,
      notes: adjustment.notes,
      referenceNumber: adjustment.referenceNumber,
      adjustmentDate: adjustment.adjustmentDate.toISOString(),
      product: adjustment.product,
      store: adjustment.store,
      createdBy: adjustment.createdByUser,
      createdAt: adjustment.createdAt.toISOString(),
      updatedAt: adjustment.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        adjustments: transformedAdjustments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Error fetching stock adjustments:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stock adjustments' },
      { status: 500 }
    )
  }
}

// POST - Create new stock adjustment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createStockAdjustmentSchema.parse(body)

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

    // Verify product exists and belongs to business
    const product = await prisma.product.findFirst({
      where: {
        id: validatedData.productId,
        businessId: validatedData.businessId
      }
    })

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Verify store exists if provided
    if (validatedData.storeId) {
      const store = await prisma.store.findFirst({
        where: {
          id: validatedData.storeId,
          businessId: validatedData.businessId
        }
      })

      if (!store) {
        return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 })
      }
    }

    // Calculate total cost
    const totalCost = validatedData.quantity * validatedData.unitCost

    // Create stock adjustment
    const adjustment = await prisma.stockAdjustment.create({
      data: {
        businessId: validatedData.businessId,
        productId: validatedData.productId,
        storeId: validatedData.storeId,
        adjustmentType: validatedData.adjustmentType,
        quantity: validatedData.quantity,
        unitCost: validatedData.unitCost,
        totalCost,
        reason: validatedData.reason,
        notes: validatedData.notes,
        referenceNumber: validatedData.referenceNumber,
        adjustmentDate: validatedData.adjustmentDate ? new Date(validatedData.adjustmentDate) : new Date(),
        createdBy: parseInt(session.user.id.toString())
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameSwahili: true,
            sku: true,
            unit: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            nameSwahili: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Get store name for movement record
    let storeLocation = 'main_store'
    let storeName = 'Main Store'
    
    if (validatedData.storeId) {
      const store = await prisma.store.findFirst({
        where: {
          id: validatedData.storeId,
          businessId: validatedData.businessId
        }
      })
      
      if (store) {
        storeLocation = `store_${validatedData.storeId}`
        storeName = store.name
      }
    }

    // Update inventory - reduce stock (prevent negative quantities)
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        businessId: validatedData.businessId,
        productId: validatedData.productId,
        location: storeLocation
      }
    })

    if (existingInventory) {
      // Check if adjustment would result in negative quantity
      const newQuantity = existingInventory.quantity - validatedData.quantity
      
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: {
          quantity: Math.max(0, newQuantity), // Prevent negative quantities
          updatedAt: new Date()
        }
      })
    } else {
      // Create new inventory record with 0 quantity (can't go negative)
      await prisma.inventory.create({
        data: {
          businessId: validatedData.businessId,
          productId: validatedData.productId,
          location: storeLocation,
          quantity: 0, // Start with 0 instead of negative
          reservedQuantity: 0
        }
      })
    }

    // Create inventory movement record with readable store name
    await prisma.inventoryMovement.create({
      data: {
        businessId: validatedData.businessId,
        productId: validatedData.productId,
        fromLocation: storeName, // Use readable store name instead of store_X
        toLocation: 'ADJUSTMENT_OUT',
        quantity: validatedData.quantity,
        movementType: 'ADJUSTMENT',
        reason: `${validatedData.adjustmentType}: ${validatedData.reason}`,
        referenceId: adjustment.id.toString(),
        createdBy: parseInt(session.user.id.toString())
      }
    })

    // Transform response
    const transformedAdjustment = {
      id: adjustment.id,
      productId: adjustment.productId,
      storeId: adjustment.storeId,
      adjustmentType: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      unitCost: Number(adjustment.unitCost),
      totalCost: Number(adjustment.totalCost),
      reason: adjustment.reason,
      notes: adjustment.notes,
      referenceNumber: adjustment.referenceNumber,
      adjustmentDate: adjustment.adjustmentDate.toISOString(),
      product: adjustment.product,
      store: adjustment.store,
      createdBy: adjustment.createdByUser,
      createdAt: adjustment.createdAt.toISOString(),
      updatedAt: adjustment.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: { adjustment: transformedAdjustment },
      message: 'Stock adjustment created successfully'
    })

  } catch (error) {
    console.error('Error creating stock adjustment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create stock adjustment' },
      { status: 500 }
    )
  }
}
