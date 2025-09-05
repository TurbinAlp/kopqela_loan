import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_CREDENTIALS'
      }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isVerified: true,
        isActive: true
      }
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Check verification status
    if (!user.isVerified) {
      return NextResponse.json({
        success: false,
        error: 'UNVERIFIED_EMAIL',
        email: user.email
      }, { status: 403 })
    }

    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        error: 'ACCOUNT_INACTIVE'
      }, { status: 403 })
    }

    // Credentials valid and user verified
    return NextResponse.json({
      success: true,
      canProceed: true
    })

  } catch (error) {
    console.error('Login check error:', error)
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
