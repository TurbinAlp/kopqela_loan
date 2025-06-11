import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { generateVerificationCode, AuthError, ValidationError } from '../../../lib/auth'
import { sendVerificationEmail } from '../../../lib/email'

interface ResendVerificationData {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ResendVerificationData = await request.json()
    
    if (!body.email) {
      throw new ValidationError('Email is required', 'email')
    }
    
    // Find user using Prisma
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: {
        business: {
          select: {
            name: true
          }
        }
      }
    })
    
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND')
    }
    
    if (user.isVerified) {
      throw new AuthError('Email already verified', 'ALREADY_VERIFIED')
    }
    
    // Rate limiting: Check if less than 1 minute since last request
    const lastUpdate = user.updatedAt
    const now = new Date()
    const timeDiff = now.getTime() - lastUpdate.getTime()
    const oneMinute = 60 * 1000
    
    if (timeDiff < oneMinute) {
      const remainingSeconds = Math.ceil((oneMinute - timeDiff) / 1000)
      throw new AuthError(
        `Please wait ${remainingSeconds} seconds before requesting another code`, 
        'RATE_LIMITED'
      )
    }
    
    // Generate new verification code
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000)
    
    // Update user with new verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: verificationCode,
        verificationExpiresAt: verificationExpiry,
      }
    })
    
    // Send verification email
    const emailSent = await sendVerificationEmail({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      code: verificationCode,
      businessName: user.business?.name
    })
    
    if (!emailSent) {
      throw new AuthError('Failed to send verification email', 'EMAIL_SEND_FAILED')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        message: 'Verification code sent successfully. Please check your email.'
      }
    })
    
  } catch (error) {
    console.error('Resend verification error:', error)
    
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

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to resend verification.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 