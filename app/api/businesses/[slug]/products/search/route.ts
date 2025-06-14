import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/prisma'

// Advanced search schema
const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['text', 'barcode', 'sku']).optional().default('text'),
  category: z.number().optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  inStock: z.boolean().optional().default(true),
  limit: z.number().min(1).max(50).optional().default(10),
  lang: z.enum(['en', 'sw']).optional().default('en'),
  includeInactive: z.boolean().optional().default(false)
})

/**
 * POST /api/businesses/[slug]/products/search
 * Advanced product search with different search types
 */
export async function POST(
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

    // Validate request body
    const body = await request.json()
    const validationResult = searchSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const {
      q, type, category, priceRange, inStock, limit, lang, includeInactive
    } = validationResult.data

    // Build where clause based on search type
    const where = {
      businessId: business.id,
      ...(includeInactive ? {} : { isActive: true }),
      ...(category && { categoryId: category }),
      ...(inStock && { 
        inventory: {
          some: {
            quantity: { gt: 0 }
          }
        }
      }),
      ...(priceRange && {
        price: {
          ...(priceRange.min !== undefined && { gte: priceRange.min }),
          ...(priceRange.max !== undefined && { lte: priceRange.max })
        }
      })
    }

    // Add search conditions based on type
    let searchConditions
    switch (type) {
      case 'barcode':
        searchConditions = {
          barcode: { equals: q, mode: 'insensitive' as const }
        }
        break
      case 'sku':
        searchConditions = {
          sku: { equals: q, mode: 'insensitive' as const }
        }
        break
      default: // text search
        searchConditions = {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { nameSwahili: { contains: q, mode: 'insensitive' as const } },
            { description: { contains: q, mode: 'insensitive' as const } },
            { sku: { contains: q, mode: 'insensitive' as const } },
            { barcode: { contains: q, mode: 'insensitive' as const } }
          ]
        }
    }

    const finalWhere = { ...where, ...searchConditions }

    // Execute search query
    const products = await prisma.product.findMany({
      where: finalWhere,
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
      orderBy: [
        // Exact matches first for barcode/sku searches
        ...(type !== 'text' ? [] : []),
        { name: 'asc' as const }
      ],
      take: limit
    })

    // Transform results for response
    const transformedProducts = products.map(product => {
      const inventory = product.inventory[0]
      const availableQuantity = inventory ? inventory.quantity - inventory.reservedQuantity : 0

      return {
        id: product.id,
        name: lang === 'sw' && product.nameSwahili ? product.nameSwahili : product.name,
        nameEnglish: product.name,
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
        isActive: product.isActive,
        category: product.category ? {
          id: product.category.id,
          name: lang === 'sw' && product.category.nameSwahili ? 
                product.category.nameSwahili : product.category.name
        } : null,
        inventory: inventory ? {
          quantity: inventory.quantity,
          availableQuantity,
          reservedQuantity: inventory.reservedQuantity,
          reorderPoint: inventory.reorderPoint,
          maxStock: inventory.maxStock,
          location: inventory.location,
          inStock: availableQuantity > 0,
          lowStock: inventory.reorderPoint ? availableQuantity <= inventory.reorderPoint : false
        } : null,
        // Search relevance score (higher for exact matches)
        relevanceScore: calculateRelevanceScore(product, q, type),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

    // Sort by relevance for text searches
    if (type === 'text') {
      transformedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore)
    }

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        searchInfo: {
          query: q,
          type,
          totalResults: products.length,
          hasMore: products.length === limit,
          searchTime: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to search products'
    }, { status: 500 })
  }
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(product: {
  name: string | null;
  nameSwahili: string | null;
  description: string | null;
  sku: string | null;
  barcode: string | null;
}, query: string, searchType: string): number {
  let score = 0
  const queryLower = query.toLowerCase()

  if (searchType === 'barcode' && product.barcode?.toLowerCase() === queryLower) {
    return 100 // Exact barcode match
  }

  if (searchType === 'sku' && product.sku?.toLowerCase() === queryLower) {
    return 100 // Exact SKU match
  }

  // Text search scoring
  if (searchType === 'text') {
    // Exact name match
    if (product.name?.toLowerCase() === queryLower || 
        product.nameSwahili?.toLowerCase() === queryLower) {
      score += 50
    }
    
    // Name starts with query
    if (product.name?.toLowerCase().startsWith(queryLower) ||
        product.nameSwahili?.toLowerCase().startsWith(queryLower)) {
      score += 30
    }
    
    // Name contains query
    if (product.name?.toLowerCase().includes(queryLower) ||
        product.nameSwahili?.toLowerCase().includes(queryLower)) {
      score += 20
    }
    
    // SKU or barcode match
    if (product.sku?.toLowerCase().includes(queryLower) ||
        product.barcode?.toLowerCase().includes(queryLower)) {
      score += 15
    }
    
    // Description contains query
    if (product.description?.toLowerCase().includes(queryLower)) {
      score += 10
    }
  }

  return score
}

/**
 * GET /api/businesses/[slug]/products/search
 * Quick search endpoint for URL-based searches
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    
    if (!q) {
      return NextResponse.json({
        success: false,
        message: 'Search query is required'
      }, { status: 400 })
    }

    // Convert URL params to POST body format
    const searchBody = {
      q,
      type: url.searchParams.get('type') || 'text',
      category: url.searchParams.get('category') ? parseInt(url.searchParams.get('category')!) : undefined,
      inStock: url.searchParams.get('inStock') !== 'false',
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 10,
      lang: url.searchParams.get('lang') || 'en'
    }

    // Reuse POST logic for GET requests
    const mockRequest = {
      json: async () => searchBody
    } as NextRequest

    return await POST(mockRequest, { params })

  } catch (error) {
    console.error('Error in GET search:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to search products'
    }, { status: 500 })
  }
} 