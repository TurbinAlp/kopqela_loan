import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../lib/prisma'
import { getAuthContext } from '../../../lib/rbac/middleware'

const storeSchema = z.object({
  businessId: z.number(),
  name: z.string().min(1, 'Store name is required'),
  nameSwahili: z.string().optional(),
  storeType: z.enum(['main_store', 'retail_store', 'warehouse']).default('retail_store'),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  managerId: z.number().optional()
})

const storesQuerySchema = z.object({
  businessId: z.string().transform(Number),
  includeInactive: z.string().transform(val => val === 'true').default('false')
})

/**
 * GET /api/admin/stores
 * Get all stores for a business
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validationResult = storesQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        errors: validationResult.error.errors
      }, { status: 400 })
    }

    const { businessId, includeInactive } = validationResult.data

    // Verify business exists and user has access
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
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

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found or access denied'
      }, { status: 404 })
    }

    // Get stores
    const stores = await prisma.store.findMany({
      where: {
        businessId,
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            inventory: true
          }
        }
      },
      orderBy: [
        { storeType: 'asc' }, // main_store first
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: {
        stores,
        total: stores.length
      }
    })

  } catch (error) {
    console.error('Error fetching stores:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/stores
 * Create a new store
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = storeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      }, { status: 400 })
    }

    const {
      businessId,
      name,
      nameSwahili,
      storeType,
      address,
      city,
      region,
      phone,
      email,
      managerId
    } = validationResult.data

    // Verify business exists and user has access
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        OR: [
          { ownerId: authContext.userId },
          {
            employees: {
              some: {
                userId: authContext.userId,
                isActive: true,
                isDeleted: false,
                role: { in: ['ADMIN', 'MANAGER'] }
              }
            }
          }
        ]
      }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found or insufficient permissions'
      }, { status: 404 })
    }

    // Check if store name already exists for this business
    const existingStore = await prisma.store.findFirst({
      where: {
        businessId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingStore) {
      return NextResponse.json({
        success: false,
        message: 'Store name already exists'
      }, { status: 400 })
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: managerId,
          businessMemberships: {
            some: {
              businessId,
              isActive: true,
              isDeleted: false
            }
          }
        }
      })

      if (!manager) {
        return NextResponse.json({
          success: false,
          message: 'Manager not found or not part of this business'
        }, { status: 400 })
      }
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        businessId,
        name,
        nameSwahili,
        storeType,
        address,
        city,
        region,
        phone,
        email: email || null,
        managerId
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Store created successfully',
      data: { store }
    })

  } catch (error) {
    console.error('Error creating store:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
