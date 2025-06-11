import { NextRequest, NextResponse } from 'next/server'
import { prisma, withTransaction, handlePrismaError } from '../../../../lib/prisma'
import { 
  hashPassword, 
  isValidEmail, 
  isValidPassword, 
  isValidPhone,
  generateBusinessSlug,
  addRandomSuffix,
  generateVerificationCode,
  ValidationError,
  AuthError
} from '../../../../lib/auth'
import { sendVerificationEmail } from '../../../../lib/email'

interface BusinessOwnerRegistrationData {
  // Owner information
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  
  // Business information
  businessName: string
  businessDescription?: string
  businessType: string
  businessAddress: string
  businessPhone?: string
  registrationNumber?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: BusinessOwnerRegistrationData = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword',
      'businessName', 'businessType', 'businessAddress'
    ]
    
    for (const field of requiredFields) {
      if (!body[field as keyof BusinessOwnerRegistrationData]) {
        throw new ValidationError(`${field} is required`, field)
      }
    }
    
    // Validate data formats
    if (!isValidEmail(body.email)) {
      throw new ValidationError('Invalid email format', 'email')
    }
    
    if (!isValidPhone(body.phone)) {
      throw new ValidationError('Invalid phone number format', 'phone')
    }
    
    if (!isValidPassword(body.password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and number', 
        'password'
      )
    }
    
    if (body.password !== body.confirmPassword) {
      throw new ValidationError('Passwords do not match', 'confirmPassword')
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      select: { id: true }
    })
    
    if (existingUser) {
      throw new AuthError('Email already registered', 'EMAIL_EXISTS')
    }
    
    // Generate business slug
    let businessSlug = generateBusinessSlug(body.businessName)
    
    // Check if slug exists and make it unique
    const existingBusiness = await prisma.business.findUnique({
      where: { slug: businessSlug },
      select: { id: true }
    })
    
    if (existingBusiness) {
      businessSlug = addRandomSuffix(businessSlug)
    }
    
    // Hash password
    const hashedPassword = await hashPassword(body.password)
    
    // Generate verification code
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    
    // Use Prisma transaction to create business and user
    const result = await withTransaction(async (tx) => {
      // Create business first
      const business = await tx.business.create({
        data: {
          name: body.businessName,
          description: body.businessDescription || '',
          businessType: body.businessType,
          slug: businessSlug,
          address: body.businessAddress,
          phone: body.businessPhone || body.phone,
          registrationNumber: body.registrationNumber || null,
          status: 'PENDING',
        },
        select: {
          id: true,
          slug: true,
          name: true
        }
      })
      
      // Create user as business owner
      const user = await tx.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email.toLowerCase(),
          phone: body.phone,
          passwordHash: hashedPassword,
          role: 'ADMIN', // Business owner is admin
          businessId: business.id,
          isVerified: false,
          verificationCode: verificationCode,
          verificationExpiresAt: verificationExpiry,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      })
      
      return { business, user }
    })
    
    // Send verification email
    const emailSent = await sendVerificationEmail({
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      code: verificationCode,
      businessName: body.businessName
    })
    
    if (!emailSent) {
      console.warn('Failed to send verification email, but registration continues')
      // Return success but with email warning
      return NextResponse.json({
        success: true,
        data: {
          userId: result.user.id,
          email: result.user.email,
          businessId: result.business.id,
          businessSlug: result.business.slug,
          verificationRequired: true,
          emailWarning: true,
          message: 'Account created successfully, but verification email failed to send. You can request a new code.'
        }
      }, { status: 201 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        email: result.user.email,
        businessId: result.business.id,
        businessSlug: result.business.slug,
        verificationRequired: true,
        message: 'Business owner registered successfully. Please check your email for verification code.'
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Business owner registration error:', error)
    
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
        { status: 409 }
      )
    }
    
    // Handle Prisma errors
    const prismaError = handlePrismaError(error)
    return NextResponse.json(
      { 
        success: false, 
        error: prismaError.message,
        code: prismaError.code,
        field: prismaError.field
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
      error: 'Method not allowed. Use POST to register business owner.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 