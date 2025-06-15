import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const customerRegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().nullable().optional(),
  role: z.literal('CUSTOMER')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = customerRegisterSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const { firstName, lastName, email, password, phone } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString()
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create customer user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        provider: 'email',
        verificationCode,
        verificationExpiresAt,
        isVerified: false // Customer will need to verify email
      }
    })

    // TODO: Send verification email
    // For now, we'll just return success
    // In production, you should send verification email here

    return NextResponse.json({
      success: true,
      message: 'Customer account created successfully. Please check your email to verify your account.',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        needsVerification: true
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Customer registration error:', error)
    
    // Check for Prisma unique constraint error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 409 })
    }

    return NextResponse.json({
      success: false,
      message: 'Registration failed. Please try again.'
    }, { status: 500 })
  }
} 