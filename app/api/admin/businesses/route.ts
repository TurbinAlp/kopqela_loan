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

    // Get all businesses user has access to (owned OR employee via BusinessUser table)
    const businesses = await prisma.business.findMany({
      where: {
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
        employees: {
          where: {
            userId: authContext.userId,
            isActive: true,
            isDeleted: false
          },
          select: {
            role: true
          }
        },
        _count: {
          select: {
            employees: {
              where: {
                isActive: true,
                isDeleted: false
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add user role to each business
    const businessesWithRoles = businesses.map(business => ({
      ...business,
      userRole: business.ownerId === authContext.userId
        ? 'ADMIN'
        : (business.employees[0]?.role || 'CUSTOMER')
    }))

    return NextResponse.json({
      success: true,
      data: businessesWithRoles
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