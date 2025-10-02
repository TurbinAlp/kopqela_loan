import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../lib/rbac/middleware'
import { Resource, Action } from '../../../lib/rbac/permissions'

/**
 * GET /api/admin/categories
 * Get categories for the authenticated user's business
 */
export async function GET(request: NextRequest) {
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

    // Check permission to read products (categories are related to products)
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.READ, businessId)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view categories'
      }, { status: 403 })
    }

    // Get categories for this business
    const categories = await prisma.category.findMany({
      where: {
        businessId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        nameSwahili: true,
        description: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const responseData = {
      success: true,
      data: {
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          nameSwahili: category.nameSwahili,
          description: category.description,
          productCount: category._count.products
        }))
      }
    }

    // 🚀 IMPROVED: Reduce cache time for better real-time updates
    const response = NextResponse.json(responseData)
    
    // Cache for 30 seconds only (categories can change frequently), allow stale for 10 seconds
    response.headers.set('Cache-Control', 'max-age=30, stale-while-revalidate=10, must-revalidate')
    response.headers.set('Vary', 'Accept-Encoding, businessId')
    
    // Generate ETag based on content for conditional requests
    const etag = `"categories-${businessId}-${categories.length}-${Date.now()}"`
    response.headers.set('ETag', etag)
    
    return response

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/categories
 * Create a new category for the authenticated user's business
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, nameSwahili, description, businessId } = body

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    // Check permission to create products (categories are related to products)
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.CREATE, businessId)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to create categories'
      }, { status: 403 })
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Category name is required'
      }, { status: 400 })
    }

    // Check if category already exists for this business
    const existingCategory = await prisma.category.findFirst({
      where: {
        businessId,
        name: { equals: name.trim(), mode: 'insensitive' }
      }
    })

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 400 })
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        businessId,
        name: name.trim(),
        nameSwahili: nameSwahili?.trim() || null,
        description: description?.trim() || null,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        nameSwahili: true,
        description: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category
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