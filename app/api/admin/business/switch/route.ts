import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth-config'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
    }

    const userId = session.user.id
    const businessIdNum = parseInt(businessId)

    // Get user's role for this business
    let userRole: string = 'customer'

    // Check if user owns this business
    const business = await prisma.business.findFirst({
      where: {
        id: businessIdNum,
        ownerId: userId
      }
    })

    if (business) {
      userRole = 'admin'
    } else {
      // Check user's role in this business
      const businessUser = await prisma.businessUser.findFirst({
        where: {
          userId,
          businessId: businessIdNum,
          isActive: true,
          isDeleted: false
        },
        select: {
          role: true
        }
      })

      if (businessUser) {
        userRole = businessUser.role.toLowerCase()
      }
    }

    // Update the session with the new role
    // Note: In a real implementation, you might want to trigger a session update
    // For now, we'll return the role and let the client handle it

    return NextResponse.json({
      success: true,
      role: userRole,
      businessId: businessIdNum,
      message: `Switched to business with role: ${userRole}`
    })

  } catch (error) {
    console.error('Error switching business:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
