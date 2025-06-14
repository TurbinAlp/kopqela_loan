import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../lib/rbac/permissions'

// Category creation/update schema
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  nameSwahili: z.string().max(255).optional(),
  description: z.string().optional(),
  parentId: z.number().optional(),
  isActive: z.boolean().optional().default(true)
})

/**
 * GET /api/businesses/[slug]/categories
 * Get categories with hierarchical structure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get business from slug
    const business = await prisma.business.findUnique({
      where: { slug: params.slug, isActive: true },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const includeProducts = url.searchParams.get('includeProducts') === 'true'
    const activeOnly = url.searchParams.get('activeOnly') !== 'false' // Default to true
    const lang = url.searchParams.get('lang') || 'en'

    // Build where clause
    const where = {
      businessId: business.id,
      ...(activeOnly && { isActive: true })
    }

    // Get categories with products count and hierarchy
    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            nameSwahili: true
          }
        },
        children: {
          where: activeOnly ? { isActive: true } : {},
          select: {
            id: true,
            name: true,
            nameSwahili: true,
            isActive: true,
            _count: {
              select: {
                products: {
                  where: activeOnly ? { isActive: true } : {}
                }
              }
            }
          }
        },
        _count: {
          select: {
            products: {
              where: activeOnly ? { isActive: true } : {}
            }
          }
        },
        ...(includeProducts && {
          products: {
            where: activeOnly ? { isActive: true } : {},
            select: {
              id: true,
              name: true,
              nameSwahili: true,
              price: true,
              imageUrl: true,
              sku: true,
              isActive: true
            },
            take: 10 // Limit products per category
          }
        })
      },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform data for response
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: lang === 'sw' && category.nameSwahili ? category.nameSwahili : category.name,
      nameEnglish: category.name,
      nameSwahili: category.nameSwahili,
      description: category.description,
      parentId: category.parentId,
      parent: category.parent ? {
        id: category.parent.id,
        name: lang === 'sw' && category.parent.nameSwahili ? 
              category.parent.nameSwahili : category.parent.name
      } : null,
      children: category.children.map(child => ({
        id: child.id,
        name: lang === 'sw' && child.nameSwahili ? child.nameSwahili : child.name,
        isActive: child.isActive,
        productCount: child._count.products
      })),
      productCount: category._count.products,
      isActive: category.isActive,
      ...(includeProducts && { products: category.products }),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    // Organize into hierarchical structure
    const rootCategories = transformedCategories.filter(cat => !cat.parentId)
    const subcategories = transformedCategories.filter(cat => cat.parentId)

    return NextResponse.json({
      success: true,
      data: {
        categories: transformedCategories,
        hierarchy: {
          root: rootCategories,
          subcategories: subcategories
        }
      }
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories'
    }, { status: 500 })
  }
}

/**
 * POST /api/businesses/[slug]/categories
 * Create a new category
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
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
      where: { slug: params.slug, isActive: true },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.CREATE, business.id)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to create categories'
      }, { status: 403 })
    }

    // Validate request body
    const body = await request.json()
    const validationResult = categorySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const { name, nameSwahili, description, parentId, isActive } = validationResult.data

    // Check if parent category exists (if provided)
    if (parentId) {
      const parentCategory = await prisma.category.findFirst({
        where: { id: parentId, businessId: business.id }
      })
      if (!parentCategory) {
        return NextResponse.json({
          success: false,
          message: 'Parent category not found'
        }, { status: 400 })
      }
    }

    // Check if category name already exists at the same level
    const existingCategory = await prisma.category.findFirst({
      where: {
        businessId: business.id,
        name: name,
        parentId: parentId || null
      }
    })

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists at this level'
      }, { status: 400 })
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        businessId: business.id,
        name,
        nameSwahili,
        description,
        parentId,
        isActive: isActive ?? true
      },
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
      message: 'Category created successfully',
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
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
} 