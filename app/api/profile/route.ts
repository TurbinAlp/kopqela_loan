import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth-config'
import prisma from '../../lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * GET /api/profile
 * Get current user profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        picture: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim()
      }
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch profile'
    }, { status: 500 })
  }
}

/**
 * PUT /api/profile
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, currentPassword, newPassword } = body

    const userId = session.user.id

    // Get current user for password verification if changing password
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    })

    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    // Update name if provided
    if (name) {
      const nameParts = name.trim().split(' ')
      updateData.firstName = nameParts[0] || ''
      updateData.lastName = nameParts.slice(1).join(' ') || ''
    }

    // Update phone if provided
    if (phone !== undefined) {
      updateData.phone = phone || null
    }

    // Update password if provided
    if (newPassword && currentPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.passwordHash || '')
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json({
          success: false,
          message: 'Current password is incorrect'
        }, { status: 400 })
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          message: 'New password must be at least 6 characters long'
        }, { status: 400 })
      }

      // Hash new password
      updateData.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        picture: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim()
      }
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile'
    }, { status: 500 })
  }
}
