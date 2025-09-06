import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../lib/rbac/permissions'
import bcrypt from 'bcryptjs'

/**
 * GET /api/admin/users/[id]
 * Get a specific user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    const userId = parseInt(id)

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

    // Check permission to read users
    const hasAccess = await hasPermission(authContext, Resource.USERS, Action.READ, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view this user'
      }, { status: 403 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Format response
    const responseUser = {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      status: 'Active', // TODO: Get from BusinessUser table
      lastLogin: user.lastLoginAt ? 
        user.lastLoginAt.toISOString().split('T')[0] : 'Never'
    }

    return NextResponse.json({
      success: true,
      data: responseUser
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    const userId = parseInt(id)

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

    // Check permission to update users
    const hasAccess = await hasPermission(authContext, Resource.USERS, Action.UPDATE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update this user'
      }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, phone, role, isActive, password } = body

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Validate email format if email is being changed
    if (email && email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({
          success: false,
          message: 'Invalid email format'
        }, { status: 400 })
      }

      // Check if email is already taken by another user
      const emailTaken = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      })

      if (emailTaken) {
        return NextResponse.json({
          success: false,
          message: 'Email is already taken by another user'
        }, { status: 409 })
      }
    }

    // Validate role if provided
    if (role && !['ADMIN', 'MANAGER', 'CASHIER', 'CUSTOMER'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role'
      }, { status: 400 })
    }

    // Validate password if provided
    if (password && password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    // Prepare update data
    const updateData: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      passwordHash?: string
    } = {}
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    // Role and isActive updates handled in BusinessUser table below
    
    // Hash password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    // Update user and BusinessUser in transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic user info
      const user = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      })

      // Update BusinessUser role/isActive if provided
      const businessUserUpdate: Record<string, unknown> = {}
      if (role !== undefined) businessUserUpdate.role = role
      if (isActive !== undefined) businessUserUpdate.isActive = isActive

      if (Object.keys(businessUserUpdate).length > 0) {
        await tx.businessUser.updateMany({
          where: {
            userId: userId,
            businessId: businessIdNum
          },
          data: businessUserUpdate
        })
      }

      return user
    })

    // TODO: If role changed, update BusinessUser permissions
    /*
    if (role && role !== existingUser.role) {
      // Remove existing business permissions
      await prisma.userPermission.deleteMany({
        where: {
          userId: userId,
          permission: {
            businessId: businessIdNum
          }
        }
      })

      // Get business permissions
      const businessPermissions = await prisma.permission.findMany({
        where: {
          OR: [
            { resource: 'BUSINESS', businessId: businessIdNum },
            { resource: 'PRODUCT', businessId: businessIdNum },
            { resource: 'ORDER', businessId: businessIdNum },
            { resource: 'CUSTOMER', businessId: businessIdNum }
          ]
        }
      })

      // Grant new permissions based on new role
      const permissionsToGrant = businessPermissions.filter(permission => {
        const actions = permission.actions as string[]
        
        switch (role) {
          case 'ADMIN':
            return true
          case 'MANAGER':
            return actions.includes('READ') || actions.includes('WRITE')
          case 'CASHIER':
            return actions.includes('READ') || 
                   (permission.resource === 'ORDER' && actions.includes('WRITE'))
          default:
            return false
        }
      })

      if (permissionsToGrant.length > 0) {
        await prisma.userPermission.createMany({
          data: permissionsToGrant.map(permission => ({
            userId: userId,
            permissionId: permission.id,
            grantedById: authContext.userId,
            grantedAt: new Date()
          }))
        })
      }
    }

    */
    
    // Get updated BusinessUser info for response
    const businessUser = await prisma.businessUser.findFirst({
      where: {
        userId: userId,
        businessId: businessIdNum
      },
      select: {
        role: true,
        isActive: true
      }
    })

    // Format response
    const responseUser = {
      ...updatedUser,
      role: businessUser?.role || 'CASHIER',
      isActive: businessUser?.isActive !== false,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      status: businessUser?.isActive !== false ? 'Active' : 'Inactive',
      lastLogin: updatedUser.lastLoginAt ? 
        updatedUser.lastLoginAt.toISOString().split('T')[0] : 'Never'
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: responseUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (soft delete by deactivating)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    const userId = parseInt(id)

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

    // Check permission to delete users
    const hasAccess = await hasPermission(authContext, Resource.USERS, Action.DELETE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete this user'
      }, { status: 403 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    const isOwnerOfThisBusiness = await prisma.business.findFirst({
      where: { 
        id: businessIdNum,
        ownerId: userId 
      }
    })

    if (isOwnerOfThisBusiness) {
      return NextResponse.json({
        success: false,
        message: 'Cannot remove business owner from their own business. Transfer ownership first.'
      }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === authContext.userId) {
      return NextResponse.json({
        success: false,
        message: 'You cannot delete your own account'
      }, { status: 400 })
    }

    // Soft delete by setting isDeleted = true in BusinessUser table
    const businessUser = await prisma.businessUser.findFirst({
      where: {
        userId: userId,
        businessId: businessIdNum,
        isDeleted: false
      }
    })

    if (!businessUser) {
      return NextResponse.json({
        success: false,
        message: 'User is not a member of this business'
      }, { status: 404 })
    }

    // Perform soft delete
    await prisma.businessUser.update({
      where: { id: businessUser.id },
      data: { 
        isDeleted: true,
        updatedAt: new Date()
      }
    })

    // Get user info for response
    const deactivatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    if (!deactivatedUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from business successfully',
      data: {
        id: deactivatedUser!.id,
        name: `${deactivatedUser!.firstName} ${deactivatedUser!.lastName}`,
        email: deactivatedUser!.email,
        status: 'Inactive'
      }
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}
