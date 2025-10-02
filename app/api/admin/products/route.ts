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
  stockAlerts: z.boolean().default(true),
  selectedStore: z.string().optional(), // Store ID for inventory

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
              location: true,
              storeId: true,
              store: {
                select: {
                  id: true,
                  name: true,
                  nameSwahili: true,
                  storeType: true
                }
              }
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

    const responseData = {
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
          inventory: product.inventory, // Return full array for dual-store system
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
    }

    // 🚀 IMPROVED: Add HTTP cache headers for better performance
    const response = NextResponse.json(responseData)
    
    // Cache for 2 minutes, allow stale for 1 minute while revalidating
    response.headers.set('Cache-Control', 'max-age=120, stale-while-revalidate=60, must-revalidate')
    response.headers.set('Vary', 'Accept-Encoding, businessId')
    
    // Generate ETag based on content for conditional requests
    const etag = `"products-${businessIdNum}-${totalCount}-${new Date().getTime()}"`
    response.headers.set('ETag', etag)
    
    return response

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
    
    // Handle price logic based on business type (no productType in payload)
    const business = await prisma.business.findUnique({ where: { id: businessIdNum }, select: { businessType: true } })
    if (!business) {
      return NextResponse.json({ success: false, message: 'Business not found' }, { status: 404 })
    }
    const bType = String(business.businessType || 'RETAIL').toUpperCase()
    const wholesalePriceParsed = productData.wholesalePrice !== undefined ? parseFloat(productData.wholesalePrice) : undefined
    const retailPriceParsed = productData.retailPrice !== undefined ? parseFloat(productData.retailPrice) : undefined

    let finalPrice: number
    if (bType === 'WHOLESALE') {
      if (!wholesalePriceParsed || wholesalePriceParsed <= 0) {
        return NextResponse.json({ success: false, message: 'Wholesale price is required for wholesale businesses' }, { status: 400 })
      }
      finalPrice = wholesalePriceParsed
    } else if (bType === 'RETAIL') {
      if (!retailPriceParsed || retailPriceParsed <= 0) {
        return NextResponse.json({ success: false, message: 'Retail price is required for retail businesses' }, { status: 400 })
      }
      finalPrice = retailPriceParsed
    } else {
      // BOTH
      if (!retailPriceParsed || retailPriceParsed <= 0) {
        return NextResponse.json({ success: false, message: 'Retail price is required for businesses supporting both' }, { status: 400 })
      }
      finalPrice = retailPriceParsed
    }

    const validationData = {
      ...productData,
      wholesalePrice: wholesalePriceParsed,
      retailPrice: retailPriceParsed,
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
      wholesalePrice, costPrice,
      sku, barcode, unit,
      currentStock, reorderLevel, maxStock,
      selectedStore, images, isDraft
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

      // Create inventory record in selected store or main_store by default
      let inventoryLocation = 'main_store' // Default fallback
      let inventoryStoreId = null

      if (selectedStore) {
        // Verify the selected store exists and belongs to this business
        const store = await tx.store.findFirst({
          where: {
            id: parseInt(selectedStore),
            businessId: businessIdNum,
            isActive: true
          }
        })

        if (store) {
          inventoryLocation = `store_${store.id}`
          inventoryStoreId = store.id
        }
      }

      await tx.inventory.create({
        data: {
          businessId: businessIdNum,
          productId: product.id,
          quantity: currentStock,
          reorderPoint: reorderLevel,
          maxStock: maxStock || 1000,
          location: inventoryLocation,
          storeId: inventoryStoreId
        }
      })

      // Skip movement record for now - will be added after server restart
      // TODO: Add inventory movement record after Prisma client regeneration

      return product
    })

    // 🚀 Cache will be invalidated on frontend refresh
    // TODO: Fix cache invalidation for server-side usage

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