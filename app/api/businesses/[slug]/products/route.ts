import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../lib/rbac/permissions'

// Product creation/update schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  nameSwahili: z.string().max(255).optional(),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  price: z.number().min(0, 'Price must be positive'),
  wholesalePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  imageUrl: z.string().max(500).optional(),
  specifications: z.record(z.any()).optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().max(255).optional(),
  variations: z.array(z.object({
    name: z.string(),
    options: z.array(z.string())
  })).optional(),
  // Inventory data
  quantity: z.number().min(0).optional().default(0),
  reorderPoint: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional()
})

// Search and filter schema
const searchSchema = z.object({
  q: z.string().optional(), // Search query
  category: z.number().optional(), // Category ID
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  active: z.boolean().optional(),
  sort: z.enum(['name', 'price', 'created', 'updated']).optional().default('created'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  lang: z.enum(['en', 'sw']).optional().default('en')
})

/**
 * GET /api/businesses/[slug]/products
 * Get products with search, filter, and pagination
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

    // Parse search parameters
    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    
    // Convert string parameters to appropriate types
    const searchParamsTyped = {
      ...searchParams,
      ...(searchParams.category && { category: parseInt(searchParams.category) }),
      ...(searchParams.minPrice && { minPrice: parseFloat(searchParams.minPrice) }),
      ...(searchParams.maxPrice && { maxPrice: parseFloat(searchParams.maxPrice) }),
      ...(searchParams.page && { page: parseInt(searchParams.page) }),
      ...(searchParams.limit && { limit: parseInt(searchParams.limit) }),
      ...(searchParams.inStock && { inStock: searchParams.inStock === 'true' }),
      ...(searchParams.active !== undefined && { active: searchParams.active === 'true' })
    }

    const validationResult = searchSchema.safeParse(searchParamsTyped)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid search parameters',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const {
      q, category, minPrice, maxPrice, inStock, active,
      sort, order, page, limit, lang
    } = validationResult.data

    // Build where clause
    const where = {
      businessId: business.id,
      ...(active !== undefined && { isActive: active }),
      ...(q && { 
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { nameSwahili: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { sku: { contains: q, mode: 'insensitive' as const } },
          { barcode: { contains: q, mode: 'insensitive' as const } }
        ]
      }),
      ...(category && { categoryId: category }),
      ...(inStock && { 
        inventory: {
          some: {
            quantity: { gt: 0 }
          }
        }
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice })
        }
      })
    }

    // Build order clause
    const orderBy = (() => {
      switch (sort) {
        case 'name':
          return lang === 'sw' 
            ? { nameSwahili: order } 
            : { name: order }
        case 'price':
          return { price: order }
        case 'updated':
          return { updatedAt: order }
        default:
          return { createdAt: order }
      }
    })()

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameSwahili: true
            }
          },
          inventory: {
            select: {
              quantity: true,
              reservedQuantity: true,
              reorderPoint: true,
              maxStock: true,
              location: true
            }
          },
          images: {
            select: {
              id: true,
              url: true,
              isPrimary: true,
              sortOrder: true
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Transform products data
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: lang === 'sw' && product.nameSwahili ? product.nameSwahili : product.name,
      nameEnglish: product.name,
      nameSwahili: product.nameSwahili,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      price: Number(product.price),
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      unit: product.unit,
      imageUrl: (() => {
        // Get primary image from product images
        const primaryImage = product.images?.find(img => img.isPrimary);
        return primaryImage?.url || null;
      })(),
      isActive: product.isActive,
      category: product.category ? {
        id: product.category.id,
        name: lang === 'sw' && product.category.nameSwahili ? 
              product.category.nameSwahili : product.category.name
      } : null,
      inventory: product.inventory.length > 0 ? {
        quantity: product.inventory[0].quantity,
        reservedQuantity: product.inventory[0].reservedQuantity,
        availableQuantity: product.inventory[0].quantity - product.inventory[0].reservedQuantity,
        reorderPoint: product.inventory[0].reorderPoint,
        maxStock: product.inventory[0].maxStock,
        location: product.inventory[0].location,
        inStock: product.inventory[0].quantity > 0,
        lowStock: product.inventory[0].reorderPoint ? product.inventory[0].quantity <= product.inventory[0].reorderPoint : false
      } : {
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        reorderPoint: null,
        maxStock: null,
        location: null,
        inStock: false,
        lowStock: false
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    // 🚀 IMPROVED: Add HTTP cache headers for customer store API
    const response = NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage
        }
      }
    })
    
    // Cache for 5 minutes for customer-facing pages, allow stale for 2 minutes
    response.headers.set('Cache-Control', 'max-age=300, stale-while-revalidate=120, public')
    response.headers.set('Vary', 'Accept-Encoding, Accept-Language')
    
    // Generate ETag based on business and content for conditional requests
    const etag = `"store-products-${business.id}-${totalCount}-${lang}-${Date.now()}"`
    response.headers.set('ETag', etag)
    
    // Add Last-Modified header
    response.headers.set('Last-Modified', new Date().toUTCString())
    
    return response

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products'
    }, { status: 500 })
  }
}

/**
 * POST /api/businesses/[slug]/products
 * Create a new product
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
        message: 'You do not have permission to create products'
      }, { status: 403 })
    }

    // Validate request body
    const body = await request.json()
    const validationResult = productSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const {
      name, nameSwahili, description, categoryId, sku, barcode,
      price, wholesalePrice, costPrice, unit,
      specifications, seoTitle, seoDescription, seoKeywords, variations,
      quantity, reorderPoint, maxStock
    } = validationResult.data

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, businessId: business.id, isActive: true }
      })
      if (!category) {
        return NextResponse.json({
          success: false,
          message: 'Category not found'
        }, { status: 400 })
      }
    }

    // Check SKU uniqueness (if provided)
    if (sku) {
      const existingProduct = await prisma.product.findFirst({
        where: { businessId: business.id, sku }
      })
      if (existingProduct) {
        return NextResponse.json({
          success: false,
          message: 'SKU already exists'
        }, { status: 400 })
      }
    }

    // Create product with inventory
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          businessId: business.id,
          categoryId,
          name,
          nameSwahili,
          description,
          sku,
          barcode,
          price,
          wholesalePrice,
          costPrice,
          unit,
          // Store additional data as JSON
          ...(specifications && { specifications }),
          ...(seoTitle && { seoTitle }),
          ...(seoDescription && { seoDescription }),
          ...(seoKeywords && { seoKeywords }),
          ...(variations && { variations })
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameSwahili: true
            }
          }
        }
      })

      // Create inventory record in main_store by default
      await tx.inventory.create({
        data: {
          businessId: business.id,
          productId: newProduct.id,
          quantity: quantity || 0,
          reorderPoint,
          maxStock,
          location: 'main_store' // Always create in main_store first
        }
      })

      // Skip movement record for now - will be added after server restart  
      // TODO: Add inventory movement record after Prisma client regeneration

      return newProduct
    })

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: product.id,
        name: product.name,
        nameSwahili: product.nameSwahili,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        price: product.price,
        wholesalePrice: product.wholesalePrice,
        costPrice: product.costPrice,
        unit: product.unit,
        isActive: product.isActive,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}