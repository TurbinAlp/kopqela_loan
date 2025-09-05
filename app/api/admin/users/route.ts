import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../lib/rbac/middleware'
import { Resource, Action } from '../../../lib/rbac/permissions'
import { sendEmployeeInvitationEmail } from '../../../lib/email'
import bcrypt from 'bcryptjs'

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

    // Get all users associated with this business (employees via BusinessUser table)
    const businessUsers = await prisma.businessUser.findMany({
      where: {
        businessId: businessIdNum
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

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, password, role, phone, isActive } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, email, password, and role are required'
      }, { status: 400 })
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessIdNum }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
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

    // Get current user (admin who created the employee) and business info
    const currentUser = await prisma.user.findUnique({
      where: { id: authContext.userId },
      select: { firstName: true, lastName: true }
    })

    // Send invitation email
    try {
      await sendEmployeeInvitationEmail({
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        code: verificationCode,
        businessName: business.name,
        role: role,
        invitedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administrator'
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail user creation if email fails
    }

    // Format response
    const userActiveStatus = isActive !== undefined ? isActive : true
    const responseUser = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      lastLoginAt: newUser.lastLoginAt,
      createdAt: newUser.createdAt,
      role,
      isActive: userActiveStatus,
      name: `${newUser.firstName} ${newUser.lastName}`,
      status: userActiveStatus ? 'Active' : 'Inactive',
      lastLogin: newUser.lastLoginAt ? 
        newUser.lastLoginAt.toISOString().split('T')[0] : 'Never',
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
