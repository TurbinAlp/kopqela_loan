import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'
import { createEastAfricaTimestamp } from '../../../lib/timezone'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const { email, password, rememberMe } = validationResult.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 })
    }

    // Check if user has a password (might be Google-only user)
    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        message: 'This email is registered with Google. Please use Google Sign In.'
      }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 })
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email before signing in',
        needsVerification: true
      }, { status: 401 })
    }

    // Update last login with East Africa timezone
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: createEastAfricaTimestamp() }
    })

    // Create JWT token
    const tokenExpiry = rememberMe ? '30d' : '24h'
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: tokenExpiry }
    )

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          picture: user.picture
        },
        token
      }
    }

    // Set HTTP-only cookie for token
    const response = NextResponse.json(responseData)
    response.cookies.set('koppela', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
} 