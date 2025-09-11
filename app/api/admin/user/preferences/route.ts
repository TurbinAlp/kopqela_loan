import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'

/**
 * GET /api/admin/user/preferences
 * Get user preferences including default business
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

    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key') || 'default_business'

    const preference = await prisma.userPreference.findFirst({
      where: {
        userId: authContext.userId,
        key: key
      }
    })

    return NextResponse.json({
      success: true,
      data: preference ? {
        key: preference.key,
        value: JSON.parse(preference.value),
        updatedAt: preference.updatedAt
      } : null
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/user/preferences
 * Set user preference (e.g., default business)
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
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Key and value are required'
      }, { status: 400 })
    }

    // Validate that the business ID belongs to the user if setting default business
    if (key === 'default_business' && value) {
      const businessId = parseInt(value)
      const hasAccess = await prisma.business.findFirst({
        where: {
          id: businessId,
          OR: [
            { ownerId: authContext.userId },
            {
              employees: {
                some: {
                  userId: authContext.userId,
                  isActive: true,
                  isDeleted: false
                }
              }
            }
          ]
        }
      })

      if (!hasAccess) {
        return NextResponse.json({
          success: false,
          message: 'You do not have access to this business'
        }, { status: 403 })
      }
    }

    const preference = await prisma.userPreference.upsert({
      where: {
        userId_key: {
          userId: authContext.userId,
          key: key
        }
      },
      update: {
        value: JSON.stringify(value),
        updatedAt: new Date()
      },
      create: {
        userId: authContext.userId,
        key: key,
        value: JSON.stringify(value)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        key: preference.key,
        value: JSON.parse(preference.value),
        updatedAt: preference.updatedAt
      }
    })

  } catch (error) {
    console.error('Error setting user preference:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}
