import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'

const updateStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').optional(),
  nameSwahili: z.string().optional(),
  storeType: z.enum(['main_store', 'retail_store', 'warehouse']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  managerId: z.number().optional(),
  isActive: z.boolean().optional()
})

/**
 * GET /api/admin/stores/[id]
 * Get a specific store by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const { id } = await params
    const storeId = parseInt(id)

    if (isNaN(storeId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid store ID'
      }, { status: 400 })
    }

    // Get store with business access check
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        business: {
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
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        },
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
      }
    })

    if (!store) {
      return NextResponse.json({
        success: false,
        message: 'Store not found or access denied'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { store }
    })

  } catch (error) {
    console.error('Error fetching store:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/stores/[id]
 * Update a store
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const { id } = await params
    const storeId = parseInt(id)

    if (isNaN(storeId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid store ID'
      }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = updateStoreSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      }, { status: 400 })
    }

    const updateData = validationResult.data

    // Check if store exists and user has access
    const existingStore = await prisma.store.findFirst({
      where: {
        id: storeId,
        business: {
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
      },
      include: {
        business: true
      }
    })

    if (!existingStore) {
      return NextResponse.json({
        success: false,
        message: 'Store not found or insufficient permissions'
      }, { status: 404 })
    }

    // Check for name conflicts if name is being updated
    if (updateData.name && updateData.name !== existingStore.name) {
      const nameConflict = await prisma.store.findFirst({
        where: {
          businessId: existingStore.businessId,
          name: {
            equals: updateData.name,
            mode: 'insensitive'
          },
          id: {
            not: storeId
          }
        }
      })

      if (nameConflict) {
        return NextResponse.json({
          success: false,
          message: 'Store name already exists'
        }, { status: 400 })
      }
    }

    // Validate manager if provided
    if (updateData.managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: updateData.managerId,
          businessMemberships: {
            some: {
              businessId: existingStore.businessId,
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

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...updateData,
        email: updateData.email === '' ? null : updateData.email
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
      message: 'Store updated successfully',
      data: { store: updatedStore }
    })

  } catch (error) {
    console.error('Error updating store:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/stores/[id]
 * Delete/deactivate a store
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const { id } = await params
    const storeId = parseInt(id)

    if (isNaN(storeId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid store ID'
      }, { status: 400 })
    }

    // Check if store exists and user has access
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        business: {
          OR: [
            { ownerId: authContext.userId },
            {
              employees: {
                some: {
                  userId: authContext.userId,
                  isActive: true,
                  isDeleted: false,
                  role: { in: ['ADMIN'] } // Only admins can delete stores
                }
              }
            }
          ]
        }
      },
      include: {
        _count: {
          select: {
            inventory: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json({
        success: false,
        message: 'Store not found or insufficient permissions'
      }, { status: 404 })
    }

    // Check if store has inventory
    if (store._count.inventory > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete store with existing inventory. Transfer inventory first.'
      }, { status: 400 })
    }

    // Soft delete by deactivating
    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Store deactivated successfully'
    })

  } catch (error) {
    console.error('Error deleting store:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
