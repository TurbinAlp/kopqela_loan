import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../lib/rbac/middleware'
import { Resource, Action } from '../../../lib/rbac/permissions'

// Product creation schema
const createProductSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(255),
  nameSw: z.string().max(255).optional(),
  descriptionEn: z.string().optional(),
  descriptionSw: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  productType: z.enum(['wholesale', 'retail', 'both']),
  wholesalePrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  unit: z.string().min(1, 'Unit is required').max(50),
  currentStock: z.number().min(0).default(0),
  minimumStock: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  location: z.string().max(255).optional(),
  stockAlerts: z.boolean().default(true),

  images: z.array(z.object({
    url: z.string().regex(/^\//, 'Must be a relative path'),
    filename: z.string(),
    originalName: z.string(),
    size: z.number(),
    mimeType: z.string(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0)
  })).optional(),
  isActive: z.boolean().default(true),
  isDraft: z.boolean().default(false)
})

/**
 * GET /api/admin/products
 * Get products for the authenticated user's business
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

    // Parse query parameters
    const url = new URL(request.url)
    const businessId = url.searchParams.get('businessId')
    
    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.READ, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view products'
      }, { status: 403 })
    }

    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const includeDrafts = url.searchParams.get('drafts') === 'true'

    // Build where clause
    const where = {
      businessId: businessIdNum,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { nameSwahili: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(category && { categoryId: parseInt(category) }),
      ...(!includeDrafts && { isDraft: false })
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
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
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' }
            ],
            select: {
              id: true,
              url: true,
              filename: true,
              originalName: true,
              size: true,
              mimeType: true,
              isPrimary: true,
              sortOrder: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          nameSwahili: product.nameSwahili,
          description: product.description,
          category: product.category,
          price: product.price,
          wholesalePrice: product.wholesalePrice,
          costPrice: product.costPrice,
          sku: product.sku,
          barcode: product.barcode,
          unit: product.unit,
          images: product.images,
          isActive: product.isActive,
          isDraft: product.isDraft,
          inventory: product.inventory[0] || null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        })),
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

  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/products
 * Create a new product for the authenticated user's business
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

    // Parse and validate request body
    const body = await request.json()
    const { businessId, ...productData } = body
    
    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.CREATE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to create products'
      }, { status: 403 })
    }
    
    console.log('Received product data:', JSON.stringify(body, null, 2))
    
    // Handle price logic based on product type
    let finalPrice: number
    if (productData.productType === 'wholesale' && productData.wholesalePrice) {
      finalPrice = parseFloat(productData.wholesalePrice)
    } else if (productData.productType === 'retail' && productData.retailPrice) {
      finalPrice = parseFloat(productData.retailPrice)
    } else if (productData.productType === 'both') {
      // Use retail price as primary price for 'both' type
      finalPrice = productData.retailPrice ? parseFloat(productData.retailPrice) : parseFloat(productData.wholesalePrice)
    } else {
      console.error('Price validation failed:', {
        productType: productData.productType,
        wholesalePrice: productData.wholesalePrice,
        retailPrice: productData.retailPrice
      })
      return NextResponse.json({
        success: false,
        message: 'Invalid price configuration for product type'
      }, { status: 400 })
    }

    const validationData = {
      ...productData,
      wholesalePrice: productData.wholesalePrice ? parseFloat(productData.wholesalePrice) : undefined,
      retailPrice: productData.retailPrice ? parseFloat(productData.retailPrice) : undefined,
      costPrice: productData.costPrice ? parseFloat(productData.costPrice) : undefined,
      currentStock: productData.currentStock ? parseInt(productData.currentStock.toString()) : 0,
      minimumStock: productData.minimumStock ? parseInt(productData.minimumStock.toString()) : undefined,
      reorderLevel: productData.reorderLevel ? parseInt(productData.reorderLevel.toString()) : undefined,
      maxStock: productData.maxStock ? parseInt(productData.maxStock.toString()) : undefined,
      // Ensure images array is properly formatted
      images: productData.images && Array.isArray(productData.images) ? productData.images : undefined
    }

    console.log('Validation data:', JSON.stringify(validationData, null, 2))

    const validationResult = createProductSchema.safeParse(validationData)
    if (!validationResult.success) {
      console.error('Schema validation failed:', validationResult.error.format())
      console.error('Validation errors:', validationResult.error.issues)
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format(),
        issues: validationResult.error.issues
      }, { status: 400 })
    }

    const {
      nameEn, nameSw, descriptionEn, category,
      productType, wholesalePrice, costPrice,
      sku, barcode, unit,
      currentStock, reorderLevel, maxStock, location,
      images, isDraft
    } = validationResult.data

    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: {
        businessId: businessIdNum,
        name: { equals: category, mode: 'insensitive' }
      }
    })

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          businessId: businessIdNum,
          name: category,
          isActive: true
        }
      })
    }



    // Create product with inventory and images using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          businessId: businessIdNum,
          categoryId: categoryRecord.id,
          name: nameEn,
          nameSwahili: nameSw,
          description: descriptionEn,
          sku,
          barcode,
          unit,
          price: finalPrice,
          wholesalePrice,
          costPrice,

          isActive: !isDraft, // If it's a draft, set inactive
          isDraft
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              nameSwahili: true
            }
          }
        }
      })

      // Create product images if provided
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image, index) => ({
            productId: product.id,
            url: image.url,
            filename: image.filename,
            originalName: image.originalName,
            size: image.size,
            mimeType: image.mimeType,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder || index
          }))
        })
      }

      // Create inventory record
      await tx.inventory.create({
        data: {
          businessId: businessIdNum,
          productId: product.id,
          quantity: currentStock,
          reorderPoint: reorderLevel,
          maxStock: maxStock || 1000, // Use provided maxStock or default to 1000
          location: location || 'Default' // Use provided location or default
        }
      })

      return product
    })

    return NextResponse.json({
      success: true,
      message: isDraft ? 'Product saved as draft' : 'Product created successfully',
      data: {
        id: result.id,
        name: result.name,
        nameSwahili: result.nameSwahili,
        description: result.description,
        business: result.business,
        category: result.category,
        price: result.price,
        wholesalePrice: result.wholesalePrice,
        costPrice: result.costPrice,

        isActive: result.isActive,
        productType,
        isDraft,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
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