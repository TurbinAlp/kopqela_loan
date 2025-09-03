import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'

const inventoryQuerySchema = z.object({
  businessId: z.string().transform(Number),
  location: z.string().optional(),
  productId: z.string().transform(Number).optional(),
  categoryId: z.string().transform(Number).optional(),
  lowStock: z.string().transform(val => val === 'true').optional(),
  outOfStock: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validationResult = inventoryQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        errors: validationResult.error.errors
      }, { status: 400 })
    }

    const {
      businessId,
      location,
      productId,
      categoryId,
      lowStock,
      outOfStock,
      page,
      limit
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
      businessId,
      product: {
        isActive: true
      }
    }

    if (location) {
      where.location = location
    }

    if (productId) {
      where.productId = productId
    }

    if (categoryId) {
      where.product.categoryId = categoryId
    }

    if (lowStock) {
      // Low stock: quantity <= reorderPoint (and reorderPoint is not null)
      where.AND = [
        { reorderPoint: { not: null } },
        { quantity: { lte: prisma.inventory.fields.reorderPoint } }
      ]
    }

    if (outOfStock) {
      where.quantity = 0
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get inventory with related data
    const [inventoryItems, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              nameSwahili: true,
              sku: true,
              price: true,
              unit: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  nameSwahili: true
                }
              },
              images: {
                where: { isPrimary: true },
                select: { url: true }
              }
            }
          }
        },
        orderBy: [
          { location: 'asc' },
          { product: { name: 'asc' } }
        ],
        skip,
        take: limit
      }),
      prisma.inventory.count({ where })
    ])

    // Group by location for better organization
    const inventoryByLocation: Record<string, any[]> = {}
    const allItems: any[] = []

    inventoryItems.forEach(item => {
      const locationKey = item.location
      
      if (!inventoryByLocation[locationKey]) {
        inventoryByLocation[locationKey] = []
      }

      const inventoryItem = {
        id: item.id,
        productId: item.productId,
        product: {
          ...item.product,
          imageUrl: item.product.images[0]?.url || null
        },
        location: item.location,
        quantity: item.quantity,
        reservedQuantity: item.reservedQuantity,
        availableQuantity: item.quantity - item.reservedQuantity,
        reorderPoint: item.reorderPoint,
        maxStock: item.maxStock,
        status: item.quantity === 0 ? 'out_of_stock' : 
                (item.reorderPoint && item.quantity <= item.reorderPoint) ? 'low_stock' : 'in_stock',
        updatedAt: item.updatedAt
      }

      inventoryByLocation[locationKey].push(inventoryItem)
      allItems.push(inventoryItem)
    })

    // Calculate summary statistics
    const summary = {
      totalProducts: totalCount,
      byLocation: {} as Record<string, any>,
      totalValue: 0
    }

    Object.keys(inventoryByLocation).forEach(loc => {
      const locationItems = inventoryByLocation[loc]
      summary.byLocation[loc] = {
        totalProducts: locationItems.length,
        totalQuantity: locationItems.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: locationItems.reduce((sum, item) => sum + (item.quantity * Number(item.product.price)), 0),
        outOfStock: locationItems.filter(item => item.status === 'out_of_stock').length,
        lowStock: locationItems.filter(item => item.status === 'low_stock').length,
        inStock: locationItems.filter(item => item.status === 'in_stock').length
      }
      summary.totalValue += summary.byLocation[loc].totalValue
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        inventory: location ? allItems : inventoryByLocation,
        summary,
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
    console.error('Error fetching location-based inventory:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch inventory data'
    }, { status: 500 })
  }
}
