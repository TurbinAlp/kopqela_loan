import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'

const movementsQuerySchema = z.object({
  businessId: z.string().transform(Number),
  productId: z.string().transform(Number).optional(),
  movementType: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validationResult = movementsQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        errors: validationResult.error.errors
      }, { status: 400 })
    }

    const {
      businessId,
      productId,
      movementType,
      fromLocation,
      toLocation,
      page,
      limit,
      startDate,
      endDate
    } = validationResult.data

    // Validate business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Build where clause for filtering
    const where: any = {
      businessId
    }

    if (productId) {
      where.productId = productId
    }

    if (movementType) {
      where.movementType = movementType
    }

    if (fromLocation) {
      where.fromLocation = fromLocation
    }

    if (toLocation) {
      where.toLocation = toLocation
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get movements with related data
    const [movements, totalCount] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameSwahili: true,
              sku: true,
              images: {
                where: { isPrimary: true },
                select: { url: true }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.inventoryMovement.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        movements: movements.map(movement => ({
          id: movement.id,
          productId: movement.productId,
          product: {
            ...movement.product,
            imageUrl: movement.product.images[0]?.url || null
          },
          fromLocation: movement.fromLocation,
          toLocation: movement.toLocation,
          quantity: movement.quantity,
          movementType: movement.movementType,
          reason: movement.reason,
          referenceId: movement.referenceId,
          createdBy: {
            id: movement.user.id,
            name: `${movement.user.firstName} ${movement.user.lastName}`
          },
          createdAt: movement.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit
        }
      }
    })

  } catch (error) {
    console.error('Error fetching inventory movements:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch inventory movements'
    }, { status: 500 })
  }
}
