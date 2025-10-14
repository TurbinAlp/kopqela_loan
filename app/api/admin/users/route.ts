import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../lib/rbac/middleware'
import { Resource, Action } from '../../../lib/rbac/permissions'
import { sendEmployeeInvitationEmail, sendBusinessInvitationEmail } from '../../../lib/email'
import bcrypt from 'bcryptjs'
import { canAddUser } from '../../../lib/subscription/middleware'

/**
 * GET /api/admin/users
 * Get all users for a specific business
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

    // Check permission to manage users
    const hasAccess = await hasPermission(authContext, Resource.USERS, Action.READ, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view users'
      }, { status: 403 })
    }

    // Get business to ensure it exists
    const business = await prisma.business.findUnique({
      where: { id: businessIdNum },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Get all users associated with this business (employees via BusinessUser table, excluding deleted)
    const businessUsers = await prisma.businessUser.findMany({
      where: {
        businessId: businessIdNum,
        isDeleted: false  // Only show non-deleted users
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            lastLoginAt: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform BusinessUser data to expected format
    const allUsers = businessUsers.map(businessUser => ({
      id: businessUser.user.id,
      firstName: businessUser.user.firstName,
      lastName: businessUser.user.lastName,
      email: businessUser.user.email,
      phone: businessUser.user.phone,
      role: businessUser.role,
      isActive: businessUser.isActive,
      lastLoginAt: businessUser.user.lastLoginAt,
      createdAt: businessUser.user.createdAt,
      name: `${businessUser.user.firstName} ${businessUser.user.lastName}`,
      status: businessUser.isActive ? 'Active' : 'Inactive',
      lastLogin: businessUser.user.lastLoginAt ? 
        businessUser.user.lastLoginAt.toISOString().split('T')[0] : 'Never',
      isOwner: false, // We'll update this for business owner
      joinedAt: businessUser.joinedAt,
      addedBy: businessUser.addedBy
    }))

    // Mark business owner in the list
    const businessOwner = await prisma.business.findUnique({
      where: { id: businessIdNum },
      select: { ownerId: true }
    })

    if (businessOwner?.ownerId) {
      const ownerUser = allUsers.find(user => user.id === businessOwner.ownerId)
      if (ownerUser) {
        ownerUser.isOwner = true
      }
    }

    return NextResponse.json({
      success: true,
      data: allUsers
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Create a new user (employee) for a specific business
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

    // Check permission to create users
    const hasAccess = await hasPermission(authContext, Resource.USERS, Action.CREATE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to create users'
      }, { status: 403 })
    }

    // Check subscription limits
    const userCheck = await canAddUser(businessIdNum)
    if (!userCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: userCheck.reason || 'User limit reached',
        data: {
          currentCount: userCheck.currentCount,
          limit: userCheck.limit,
          planName: userCheck.planName,
          upgradeRequired: true
        }
      }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, password, role, phone, isActive, inviteExistingUser } = body

    // Validate required fields - different validation for existing vs new users
    if (inviteExistingUser) {
      // For existing users, only email and role are required
      if (!email || !role) {
        return NextResponse.json({
          success: false,
          message: 'Email and role are required for existing user invitation'
        }, { status: 400 })
      }
    } else {
      // For new users, all fields are required
      if (!firstName || !lastName || !email || !password || !role) {
        return NextResponse.json({
          success: false,
          message: 'First name, last name, email, password, and role are required'
        }, { status: 400 })
      }
    }

    // Validate role
    if (!['ADMIN', 'MANAGER', 'CASHIER'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role. Must be ADMIN, MANAGER, or CASHIER'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 })
    }

    // Validate password length (only for new users)
    if (!inviteExistingUser && password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessIdNum },
      select: { id: true, name: true }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        phone: true, 
        isVerified: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (inviteExistingUser) {
      // For existing user invitation
      if (!existingUser) {
        return NextResponse.json({
          success: false,
          message: 'User with this email does not exist in the system'
        }, { status: 404 })
      }

      // Check if user is already a member of this business (including deleted ones)
      const existingBusinessUser = await prisma.businessUser.findFirst({
        where: {
          userId: existingUser.id,
          businessId: businessIdNum
        }
      })

      if (existingBusinessUser) {
        if (existingBusinessUser.isDeleted) {
          // User was previously deleted, restore them with new role
          await prisma.businessUser.update({
            where: { id: existingBusinessUser.id },
            data: {
              role: role,
              isActive: isActive !== undefined ? isActive : true,
              isDeleted: false,  // Restore user
              addedBy: authContext.userId
            }
          })
          
          // Variables will be set later in the flow
        } else {
          // User is currently active in this business
          return NextResponse.json({
            success: false,
            message: 'User is already a member of this business'
          }, { status: 409 })
        }
      } else {
        // User is not a member, create new BusinessUser entry
        // Create BusinessUser relationship with role and status
        await prisma.businessUser.create({
          data: {
            businessId: businessIdNum,
            userId: existingUser.id,
            role: role,
            isActive: isActive !== undefined ? isActive : true,
            isDeleted: false,
            addedBy: authContext.userId
          }
        })
      }
    } else {
      // For new user creation
      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'User with this email already exists. Use "Invite Existing User" option instead.'
        }, { status: 409 })
      }
    }

    let targetUser
    let emailType = 'employee_invitation' // Default for new users
    let verificationCode: string | undefined // For new users only

    if (!inviteExistingUser) {
      // For new user creation
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Generate verification code
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create user
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          passwordHash,
          isVerified: false, 
          verificationCode,
          verificationExpiresAt
        },
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

      targetUser = newUser

      // Create BusinessUser relationship with role and status
      await prisma.businessUser.create({
        data: {
          businessId: businessIdNum,
          userId: newUser.id,
          role: role,
          isActive: isActive !== undefined ? isActive : true,
          addedBy: authContext.userId
        }
      })
    }

    // Set target user and email type for existing users (since we handled them above)
    if (inviteExistingUser && !targetUser) {
      targetUser = existingUser
      emailType = 'business_invitation'
    }

    // Validate that we have a target user
    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create or find user'
      }, { status: 500 })
    }

    // Get current user (admin who created the employee) and business info
    const currentUser = await prisma.user.findUnique({
      where: { id: authContext.userId },
      select: { firstName: true, lastName: true }
    })

    // Send appropriate email based on email type
    try {
      if (emailType === 'business_invitation') {
        // Send business invitation email to existing user
        await sendBusinessInvitationEmail({
          name: `${targetUser.firstName} ${targetUser.lastName}`,
          email: targetUser.email,
          businessName: business.name,
          role: role,
          invitedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administrator'
        })
      } else {
        // Send employee invitation email to new user
        if (!verificationCode) {
          throw new Error('Verification code is required for new user')
        }
        await sendEmployeeInvitationEmail({
          name: `${targetUser.firstName} ${targetUser.lastName}`,
          email: targetUser.email,
          code: verificationCode,
          businessName: business.name,
          role: role,
          invitedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administrator'
        })
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail user creation if email fails
    }

    // Format response
    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create or find user'
      }, { status: 500 })
    }

    const userActiveStatus = isActive !== undefined ? isActive : true
    const responseUser = {
      id: targetUser.id,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      email: targetUser.email,
      phone: targetUser.phone,
      lastLoginAt: targetUser.lastLoginAt,
      createdAt: targetUser.createdAt,
      role,
      isActive: userActiveStatus,
      name: `${targetUser.firstName} ${targetUser.lastName}`,
      status: userActiveStatus ? 'Active' : 'Inactive',
      lastLogin: targetUser.lastLoginAt ? 
        targetUser.lastLoginAt.toISOString().split('T')[0] : 'Never',
      isOwner: false
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Verification email sent.',
      data: responseUser
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
}
