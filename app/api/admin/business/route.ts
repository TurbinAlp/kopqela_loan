import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../lib/rbac/middleware'
import { Resource, Action } from '../../../lib/rbac/permissions'

/**
 * GET /api/admin/business
 * Get business details including owner for the authenticated user's business
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
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission to read business data
    const hasAccess = await hasPermission(authContext, Resource.BUSINESS, Action.READ, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view business details'
      }, { status: 403 })
    }

    // Get business details with owner information and settings
    const business = await prisma.business.findUnique({
      where: {
        id: businessIdNum
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true
          }
        },
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
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          businessType: business.businessType,
          slug: business.slug,
          status: business.status,
          isActive: business.isActive,
          createdAt: business.createdAt,
          updatedAt: business.updatedAt,
          // Business settings data
          description: business.businessSetting?.description,
          address: business.businessSetting?.address,
          phone: business.businessSetting?.phone,
          email: business.businessSetting?.email,
          registrationNumber: business.businessSetting?.registrationNumber,
          logoUrl: business.businessSetting?.logoUrl,
          currency: business.businessSetting?.currency,
          timezone: business.businessSetting?.timezone,
          language: business.businessSetting?.language,
          owner: business.owner ? {
            id: business.owner.id,
            name: `${business.owner.firstName} ${business.owner.lastName}`,
            email: business.owner.email,
            phone: business.owner.phone,
            role: business.owner.role,
            createdAt: business.owner.createdAt
          } : null,
          stats: {
            totalProducts: business._count.products,
            totalCategories: business._count.categories,
            totalOrders: business._count.orders,
            totalEmployees: 1 // Hardcoded since we removed users relation
          }
        }
      }
    })

  } catch (error) {
    console.error('Error fetching business details:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/business
 * Update business details
 */
export async function PUT(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, ...updateData } = body

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission to update business data
    const hasAccess = await hasPermission(authContext, Resource.BUSINESS, Action.UPDATE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update business details'
      }, { status: 403 })
    }

    const {
      name,
      description,
      businessType,
      address,
      phone,
      email,
      registrationNumber,
      currency,
      timezone,
      language,
      logoUrl
    } = updateData

    // Update business basic info
    const businessUpdate: { name?: string; businessType?: string } = {}
    if (name) businessUpdate.name = name
    if (businessType) businessUpdate.businessType = businessType

    // Update business settings
    const settingsUpdate: {
      description?: string | null
      address?: string | null
      phone?: string | null
      email?: string | null
      registrationNumber?: string | null
      currency?: string
      timezone?: string
      language?: string
      logoUrl?: string | null
    } = {}
    if (description !== undefined) settingsUpdate.description = description
    if (address !== undefined) settingsUpdate.address = address
    if (phone !== undefined) settingsUpdate.phone = phone
    if (email !== undefined) settingsUpdate.email = email
    if (registrationNumber !== undefined) settingsUpdate.registrationNumber = registrationNumber
    if (currency) settingsUpdate.currency = currency
    if (timezone) settingsUpdate.timezone = timezone
    if (language) settingsUpdate.language = language
    if (logoUrl !== undefined) settingsUpdate.logoUrl = logoUrl

    // Update business and settings in transaction
    const updatedBusiness = await prisma.$transaction(async (tx) => {
      // Update business basic info if needed
      if (Object.keys(businessUpdate).length > 0) {
        await tx.business.update({
          where: { id: businessIdNum },
          data: businessUpdate
        })
      }

      // Update or create business settings if needed
      if (Object.keys(settingsUpdate).length > 0) {
        await tx.businessSetting.upsert({
          where: { businessId: businessIdNum },
          update: settingsUpdate,
          create: {
            businessId: businessIdNum,
            ...settingsUpdate
          }
        })
      }

      // Return updated business with settings
      return await tx.business.findUnique({
        where: { id: businessIdNum },
        include: {
          businessSetting: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Business updated successfully',
      data: {
        business: updatedBusiness
      }
    })

  } catch (error) {
    console.error('Error updating business:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
} 