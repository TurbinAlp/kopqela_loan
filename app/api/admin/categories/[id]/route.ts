import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../lib/rbac/permissions'

/**
 * GET /api/admin/categories/[id]
 * Get a specific category for the authenticated user's business
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Get businessId from query parameters
    const { searchParams } = new URL(request.url)
    const businessIdParam = searchParams.get('businessId')
    
    if (!businessIdParam) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessId = parseInt(businessIdParam)

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.READ, businessId)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view categories'
      }, { status: 403 })
    }

    const resolvedParams = await params
    const categoryId = parseInt(resolvedParams.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category ID'
      }, { status: 400 })
    }

    // Get category
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId
      },
      select: {
        id: true,
        name: true,
        nameSwahili: true,
        description: true,
        isActive: true,
        _count: {
          select: {
            products: true
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
        isActive: category.isActive,
        productCount: category._count.products
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
 * PUT /api/admin/categories/[id]
 * Update a category for the authenticated user's business
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const resolvedParams = await params
    const categoryId = parseInt(resolvedParams.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category ID'
      }, { status: 400 })
    }

    const body = await request.json()
    const { name, nameSwahili, description, isActive, businessId } = body

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.UPDATE, businessId)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update categories'
      }, { status: 403 })
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Category name is required'
      }, { status: 400 })
    }

    // Check if category exists and belongs to this business
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId
      }
    })

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 })
    }

    // Check if another category with this name exists (excluding current one)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        businessId,
        name: { equals: name.trim(), mode: 'insensitive' },
        id: { not: categoryId }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 400 })
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId
      },
      data: {
        name: name.trim(),
        nameSwahili: nameSwahili?.trim() || null,
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive
      },
      select: {
        id: true,
        name: true,
        nameSwahili: true,
        description: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
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
 * DELETE /api/admin/categories/[id]
 * Delete a category for the authenticated user's business
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Get businessId from query parameters
    const { searchParams } = new URL(request.url)
    const businessIdParam = searchParams.get('businessId')
    
    if (!businessIdParam) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessId = parseInt(businessIdParam)

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.DELETE, businessId)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete categories'
      }, { status: 403 })
    }

    const resolvedParams = await params
    const categoryId = parseInt(resolvedParams.id)
    if (isNaN(categoryId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category ID'
      }, { status: 400 })
    }

    // Check if category exists and belongs to this business
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true
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

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete category "${existingCategory.name}" because it has ${existingCategory._count.products} product(s). Please move or delete the products first.`
      }, { status: 400 })
    }

    // Delete category
    await prisma.category.delete({
      where: {
        id: categoryId
      }
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