import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../../lib/rbac/permissions'

// Category update schema
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255).optional(),
  nameSwahili: z.string().max(255).optional(),
  description: z.string().optional(),
  parentId: z.number().optional(),
  isActive: z.boolean().optional()
})

/**
 * GET /api/businesses/[slug]/categories/[id]
 * Get a single category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const resolvedParams = await params
    const categoryId = parseInt(resolvedParams.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category ID'
      }, { status: 400 })
    }

    // Get business from slug
    const business = await prisma.business.findUnique({
      where: { slug: resolvedParams.slug, isActive: true },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Get category
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: business.id
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameSwahili: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            nameSwahili: true,
            isActive: true,
            _count: {
              select: {
                products: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        nameSwahili: category.nameSwahili,
        description: category.description,
        parentId: category.parentId,
        parent: category.parent,
        children: category.children.map(child => ({
          id: child.id,
          name: child.name,
          nameSwahili: child.nameSwahili,
          isActive: child.isActive,
          productCount: child._count.products
        })),
        productCount: category._count.products,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch category'
    }, { status: 500 })
  }
}

/**
 * PUT /api/businesses/[slug]/categories/[id]
 * Update a category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const resolvedParams = await params
    const categoryId = parseInt(resolvedParams.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category ID'
      }, { status: 400 })
    }

    // Get auth context
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Get business from slug
    const business = await prisma.business.findUnique({
      where: { slug: resolvedParams.slug, isActive: true },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.CATEGORIES, Action.MANAGE, business.id)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update categories'
      }, { status: 403 })
    }

    // Check if category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: business.id
      }
    })

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 })
    }

    // Validate request body
    const body = await request.json()
    const validationResult = updateCategorySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const { name, nameSwahili, description, parentId, isActive } = validationResult.data

    // Check if parent category exists (if provided)
    if (parentId !== undefined) {
      if (parentId === null) {
        // Allow null to remove parent
      } else if (parentId === categoryId) {
        return NextResponse.json({
          success: false,
          message: 'Category cannot be its own parent'
        }, { status: 400 })
      } else {
        const parentCategory = await prisma.category.findFirst({
          where: { id: parentId, businessId: business.id }
        })
        if (!parentCategory) {
          return NextResponse.json({
            success: false,
            message: 'Parent category not found'
          }, { status: 400 })
        }

        // Check for circular reference
        const checkCircular = async (currentParentId: number, targetId: number): Promise<boolean> => {
          if (currentParentId === targetId) return true
          
          const parent = await prisma.category.findFirst({
            where: { id: currentParentId },
            select: { parentId: true }
          })
          
          if (parent?.parentId) {
            return await checkCircular(parent.parentId, targetId)
          }
          
          return false
        }

        const hasCircularRef = await checkCircular(parentId, categoryId)
        if (hasCircularRef) {
          return NextResponse.json({
            success: false,
            message: 'This would create a circular reference'
          }, { status: 400 })
        }
      }
    }

    // Check if category name already exists at the same level (if name is being changed)
    if (name && name !== existingCategory.name) {
      const existingNameCategory = await prisma.category.findFirst({
        where: {
          businessId: business.id,
          name: name,
          parentId: parentId !== undefined ? parentId : existingCategory.parentId,
          id: { not: categoryId }
        }
      })

      if (existingNameCategory) {
        return NextResponse.json({
          success: false,
          message: 'Category with this name already exists at this level'
        }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (nameSwahili !== undefined) updateData.nameSwahili = nameSwahili
    if (description !== undefined) updateData.description = description
    if (parentId !== undefined) updateData.parentId = parentId
    if (isActive !== undefined) updateData.isActive = isActive

    // Update category
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameSwahili: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: category.id,
        name: category.name,
        nameSwahili: category.nameSwahili,
        description: category.description,
        parentId: category.parentId,
        parent: category.parent,
        productCount: category._count.products,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating category:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * DELETE /api/businesses/[slug]/categories/[id]
 * Delete a category (soft delete by setting isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const resolvedParams = await params
    const categoryId = parseInt(resolvedParams.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category ID'
      }, { status: 400 })
    }

    // Get auth context
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Get business from slug
    const business = await prisma.business.findUnique({
      where: { slug: resolvedParams.slug, isActive: true },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.CATEGORIES, Action.MANAGE, business.id)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete categories'
      }, { status: 403 })
    }

    // Check if category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: business.id
      },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            },
            children: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 })
    }

    // Check if category has active products
    if (existingCategory._count.products > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete category that contains active products'
      }, { status: 400 })
    }

    // Check if category has active subcategories
    if (existingCategory._count.children > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete category that has active subcategories'
      }, { status: 400 })
    }

    // Soft delete the category
    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
} 