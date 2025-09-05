import { NextRequest, NextResponse } from 'next/server'
import { prisma, withTransaction, handlePrismaError } from '../../../lib/prisma'
import { generateToken, AuthError, ValidationError } from '../../../lib/auth'
import { sendWelcomeEmail } from '../../../lib/email'

interface EmailVerificationData {
  email: string
  code: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: EmailVerificationData = await request.json()
    
    // Validate required fields
    if (!body.email || !body.code) {
      throw new ValidationError('Email and verification code are required', 'email')
    }
    
    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(body.code)) {
      throw new ValidationError('Verification code must be 6 digits', 'code')
    }
    
    // Find user with verification code using Prisma
    const user = await prisma.user.findFirst({
      where: {
        email: body.email.toLowerCase(),
        verificationCode: body.code,
        verificationExpiresAt: {
          gt: new Date()
        },
        isVerified: false
      },
      include: {
        ownedBusinesses: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
    
    if (!user) {
      // Check if user exists but code is wrong/expired
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
        select: { 
          id: true, 
          isVerified: true 
        }
      })
      
      if (!existingUser) {
        throw new AuthError('User not found', 'USER_NOT_FOUND')
      }
      
      if (existingUser.isVerified) {
        throw new AuthError('Email already verified', 'ALREADY_VERIFIED')
      }
      
      throw new AuthError('Invalid or expired verification code', 'INVALID_CODE')
    }
    
    // Update user and business using transaction
    const updatedUser = await withTransaction(async (tx) => {
      // Update user as verified
      const verifiedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationCode: null,
          verificationExpiresAt: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          ownedBusinesses: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      })
      
      // Update business status to active (if it's a business owner)
      const ownedBusiness = user.ownedBusinesses?.[0]
      if (ownedBusiness) {
        // Check if user has ADMIN role for this business
        const businessUser = await tx.businessUser.findFirst({
          where: {
            userId: user.id,
            businessId: ownedBusiness.id,
            role: 'ADMIN'
          }
        })
        
        if (businessUser) {
          await tx.business.update({
            where: { id: ownedBusiness.id },
            data: { status: 'ACTIVE' }
          })
        }
      }
      
      return verifiedUser
    })
    
    // Generate JWT token
    const ownedBusiness = updatedUser.ownedBusinesses?.[0]
    const token = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      businessId: ownedBusiness?.id || null,
      businessSlug: ownedBusiness?.slug
    })
    
    // Send welcome email (if user owns a business)
    if (ownedBusiness) {
      const welcomeEmailSent = await sendWelcomeEmail({
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        businessName: ownedBusiness.name,
        businessSlug: ownedBusiness.slug,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
      })
      
      if (!welcomeEmailSent) {
        console.warn('Failed to send welcome email, but verification continues')
      }
    }
    
    // Set httpOnly cookie with JWT
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          businessId: ownedBusiness?.id || null,
          businessSlug: ownedBusiness?.slug
        },
        message: 'Email verified successfully!'
      }
    })
    
    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    
    return response
    
  } catch (error) {
    console.error('Email verification error:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          field: error.field,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code
        },
        { status: 400 }
      )
    }
    
    // Handle Prisma errors
    const prismaError = handlePrismaError(error)
    return NextResponse.json(
      { 
        success: false, 
        error: prismaError.message,
        code: prismaError.code
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to verify email.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 