import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

/**
 * GET /api/businesses/[slug]
 * Get business details by slug (for customer store pages)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const { slug } = resolvedParams

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Business slug is required' },
        { status: 400 }
      )
    }

    // Get business from slug
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        businessSetting: true,
        _count: {
          select: {
            products: true,
            categories: true,
            orders: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, message: 'Business not found' },
        { status: 404 }
      )
    }

    // Return business data
    return NextResponse.json({
      success: true,
      data: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        businessType: business.businessType,
        createdAt: business.createdAt,
        businessSetting: business.businessSetting,
        _count: business._count
      }
    })

  } catch (error) {
    console.error('Error fetching business by slug:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch business details' },
      { status: 500 }
    )
  }
} 