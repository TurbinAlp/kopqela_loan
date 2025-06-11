import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { generateVerificationCode, AuthError, ValidationError, isValidEmail } from '../../../lib/auth'
import { sendPasswordResetEmail } from '../../../lib/email'

interface ForgotPasswordData {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordData = await request.json()
    
    if (!body.email) {
      throw new ValidationError('Email is required', 'email')
    }
    
    if (!isValidEmail(body.email)) {
      throw new ValidationError('Invalid email format', 'email')
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
    
    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          email: body.email,
          message: 'If an account with this email exists, you will receive a password reset link.'
        }
      })
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      throw new AuthError('Please verify your email address first', 'EMAIL_NOT_VERIFIED')
    }
    
    // Rate limiting: Check if less than 5 minutes since last request
    const lastUpdate = user.updatedAt
    const now = new Date()
    const timeDiff = now.getTime() - lastUpdate.getTime()
    const fiveMinutes = 5 * 60 * 1000
    
    if (timeDiff < fiveMinutes) {
      const remainingMinutes = Math.ceil((fiveMinutes - timeDiff) / (60 * 1000))
      throw new AuthError(
        `Please wait ${remainingMinutes} minute(s) before requesting another password reset`, 
        'RATE_LIMITED'
      )
    }
    
    // Generate password reset token (6-digit code for simplicity)
    const resetToken = generateVerificationCode()
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    
    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiresAt: resetTokenExpiry,
      }
    })
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      code: resetToken,
      businessName: user.business?.name
    })
    
    if (!emailSent) {
      throw new AuthError('Failed to send password reset email', 'EMAIL_SEND_FAILED')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        message: 'Password reset code sent successfully. Please check your email.'
      }
    })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    
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
      error: 'Method not allowed. Use POST to request password reset.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 