import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { isValidEmail } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required',
          code: 'EMAIL_REQUIRED'
        },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      )
    }

    // Check if email already exists using Prisma
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      },
      select: {
        id: true,
        email: true
      }
    })

    const isAvailable = !existingUser

    if (!isAvailable) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This email is already registered. Please use a different email or try logging in.',
          code: 'EMAIL_EXISTS',
          available: false
        },
        { status: 409 }
      )
    }

    // Email is available
    return NextResponse.json({
      success: true,
      data: {
        email: email.toLowerCase(),
        available: true,
        message: 'Email is available for registration'
      }
    })

  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check email availability',
        code: 'CHECK_FAILED'
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
      error: 'Method not allowed. Use POST to check email availability.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 