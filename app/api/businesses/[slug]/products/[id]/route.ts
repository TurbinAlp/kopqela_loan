import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../../lib/rbac/permissions'

// Product update schema (same as create but all optional except price)
const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255).optional(),
  nameSwahili: z.string().max(255).optional(),
  description: z.string().optional(),
  categoryId: z.number().optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
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
  isActive: z.boolean().optional(),
  // Inventory updates
  quantity: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  location: z.string().max(100).optional()
})

/**
 * GET /api/businesses/[slug]/products/[id]
 * Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = parseInt(resolvedParams.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid product ID'
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

    // Get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId: business.id
      },
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
      }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
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
        imageUrl: (() => {
          // Get primary image from product images
          const primaryImage = product.images?.find(img => img.isPrimary);
          return primaryImage?.url || product.images?.[0]?.url || null;
        })(),
        images: product.images || [],
        isActive: product.isActive,
        category: product.category,
        inventory: product.inventory[0] || null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product'
    }, { status: 500 })
  }
}

/**
 * PUT /api/businesses/[slug]/products/[id]
 * Update a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = parseInt(resolvedParams.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid product ID'
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
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.UPDATE, business.id)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update products'
      }, { status: 403 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId: business.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 })
    }

    // Validate request body
    const body = await request.json()
    const validationResult = updateProductSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const {
      name, nameSwahili, description, categoryId, sku, barcode,
      price, wholesalePrice, costPrice, unit, imageUrl,
      specifications, seoTitle, seoDescription, seoKeywords, variations,
      isActive, quantity, reorderPoint, maxStock, location
    } = validationResult.data

    // Check if category exists (if provided)
    if (categoryId !== undefined) {
      if (categoryId === null) {
        // Allow null to remove category
      } else {
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
    }

    // Check SKU uniqueness (if provided and different from current)
    if (sku && sku !== existingProduct.sku) {
      const existingSkuProduct = await prisma.product.findFirst({
        where: { 
          businessId: business.id, 
          sku,
          id: { not: productId }
        }
      })
      if (existingSkuProduct) {
        return NextResponse.json({
          success: false,
          message: 'SKU already exists'
        }, { status: 400 })
      }
    }

    // Update product with inventory
    const product = await prisma.$transaction(async (tx) => {
      // Prepare product update data
      const productUpdateData: Record<string, unknown> = {}
      if (name !== undefined) productUpdateData.name = name
      if (nameSwahili !== undefined) productUpdateData.nameSwahili = nameSwahili
      if (description !== undefined) productUpdateData.description = description
      if (categoryId !== undefined) productUpdateData.categoryId = categoryId
      if (sku !== undefined) productUpdateData.sku = sku
      if (barcode !== undefined) productUpdateData.barcode = barcode
      if (price !== undefined) productUpdateData.price = price
      if (wholesalePrice !== undefined) productUpdateData.wholesalePrice = wholesalePrice
      if (costPrice !== undefined) productUpdateData.costPrice = costPrice
      if (unit !== undefined) productUpdateData.unit = unit
      if (imageUrl !== undefined) productUpdateData.imageUrl = imageUrl
      if (isActive !== undefined) productUpdateData.isActive = isActive
      if (specifications !== undefined) productUpdateData.specifications = specifications
      if (seoTitle !== undefined) productUpdateData.seoTitle = seoTitle
      if (seoDescription !== undefined) productUpdateData.seoDescription = seoDescription
      if (seoKeywords !== undefined) productUpdateData.seoKeywords = seoKeywords
      if (variations !== undefined) productUpdateData.variations = variations

      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: productUpdateData,
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

      // Update inventory if any inventory fields are provided
      const inventoryUpdateData: Record<string, unknown> = {}
      if (quantity !== undefined) inventoryUpdateData.quantity = quantity
      if (reorderPoint !== undefined) inventoryUpdateData.reorderPoint = reorderPoint
      if (maxStock !== undefined) inventoryUpdateData.maxStock = maxStock
      if (location !== undefined) inventoryUpdateData.location = location

      if (Object.keys(inventoryUpdateData).length > 0) {
        await tx.inventory.upsert({
          where: {
            businessId_productId: {
              businessId: business.id,
              productId: productId
            }
          },
          create: {
            businessId: business.id,
            productId: productId,
            quantity: quantity || 0,
            reorderPoint,
            maxStock,
            location
          },
          update: inventoryUpdateData
        })
      }

      return updatedProduct
    })

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
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
        imageUrl: null, // Legacy field - images are now in separate ProductImage table
        isActive: product.isActive,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating product:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * DELETE /api/businesses/[slug]/products/[id]
 * Delete a product (soft delete by setting isActive to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = parseInt(resolvedParams.id)
    if (isNaN(productId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid product ID'
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
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.DELETE, business.id)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete products'
      }, { status: 403 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        businessId: business.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 })
    }

    // Check if product is used in any active orders
    const activeOrderItems = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED']
          }
        }
      }
    })

    if (activeOrderItems) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete product that is used in active orders'
      }, { status: 400 })
    }

    // Soft delete the product
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}