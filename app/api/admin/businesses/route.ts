import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { getAuthContext } from '../../../lib/rbac/middleware'

/**
 * GET /api/admin/businesses
 * Get all businesses owned by the authenticated user
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

    // Get all businesses user has access to (owned OR employee)
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { ownerId: authContext.userId }, // Businesses owned by user
          { 
            employees: {
              some: {
                userId: authContext.userId,
                isActive: true
              }
            }
          } // Businesses where user is an active employee
        ]
      },
      include: {
        businessSetting: {
          select: {
            description: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            region: true,
            country: true
          }
        },

      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: businesses
    })

  } catch (error) {
    console.error('Error fetching businesses:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
} 