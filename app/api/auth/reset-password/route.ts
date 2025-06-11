import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../lib/prisma'
import { hashPassword, AuthError, ValidationError, isValidPassword } from '../../../lib/auth'

interface ResetPasswordData {
  email: string
  code: string
  newPassword: string
  confirmPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordData = await request.json()
    
    // Validate required fields
    if (!body.email) {
      throw new ValidationError('Email is required', 'email')
    }
    
    if (!body.code) {
      throw new ValidationError('Reset code is required', 'code')
    }
    
    if (!body.newPassword) {
      throw new ValidationError('New password is required', 'newPassword')
    }
    
    if (!body.confirmPassword) {
      throw new ValidationError('Password confirmation is required', 'confirmPassword')
    }
    
    // Validate password format
    if (!isValidPassword(body.newPassword)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and number', 
        'newPassword'
      )
    }
    
    // Check if passwords match
    if (body.newPassword !== body.confirmPassword) {
      throw new ValidationError('Passwords do not match', 'confirmPassword')
    }
    
    // Find user with reset token
    const user = await prisma.user.findFirst({
      where: {
        email: body.email.toLowerCase(),
        resetToken: body.code,
        resetTokenExpiresAt: {
          gt: new Date() // Token must not be expired
        }
      }
    })
    
    if (!user) {
      throw new AuthError('Invalid or expired reset code', 'INVALID_RESET_CODE')
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(body.newPassword)
    
    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Password reset successfully. You can now log in with your new password.'
      }
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
    
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
      error: 'Method not allowed. Use POST to reset password.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 