import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

/**
 * GET /api/stores
 * Get all active businesses for public store listing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    // Get businesses from database
    const businesses = await prisma.business.findMany({
      where: {
        isActive: true, // Only show active businesses
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { businessType: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(category && category !== 'all' && { businessType: category })
      },
      include: {
        businessSetting: true,
        _count: {
          select: {
            products: true,
            categories: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedBusinesses = businesses.map(business => {
      const setting = business.businessSetting
      
      return {
        id: business.id.toString(),
        slug: business.slug,
        name: business.name,
        description: setting?.description || '',
        logo: setting?.logoUrl || null,
        primaryColor: setting?.primaryColor || '#059669',
        secondaryColor: setting?.secondaryColor || '#10b981',
        contactPhone: setting?.phone || '',
        contactEmail: setting?.email || '',
        address: setting?.address || '',
        businessType: business.businessType,
        status: 'active' as const,
        deliveryAreas: ['City Center'],
        paymentMethods: ['Cash', 'Mobile Money'],
        workingHours: {
          monday: { open: '08:00', close: '18:00', isOpen: true },
          tuesday: { open: '08:00', close: '18:00', isOpen: true },
          wednesday: { open: '08:00', close: '18:00', isOpen: true },
          thursday: { open: '08:00', close: '18:00', isOpen: true },
          friday: { open: '08:00', close: '18:00', isOpen: true },
          saturday: { open: '08:00', close: '16:00', isOpen: true },
          sunday: { open: '10:00', close: '14:00', isOpen: true }
        },
        settings: {
          allowCredit: setting?.enableCreditSales || false,
          allowPartialPayment: false,
          minimumOrderAmount: 0,
          deliveryFee: 2000,
          taxRate: setting?.taxRate ? Number(setting.taxRate) / 100 : 0.18
        },
        _count: business._count
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedBusinesses,
      total: transformedBusinesses.length
    })

  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
} 