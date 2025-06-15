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
  phone?: string  // Make phone optional
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
    
    // Validate required fields (phone is optional)
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'confirmPassword',
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
    
    // Only validate phone if provided (phone is optional)
    if (body.phone && !isValidPhone(body.phone)) {
      throw new ValidationError('Invalid phone number format. Please use Tanzania format (e.g., +255712345678 or 0712345678)', 'phone')
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
    
    // Use Prisma transaction to create user and business
    const result = await withTransaction(async (tx) => {
      // Create user first (business owner)
      const user = await tx.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email.toLowerCase(),
          phone: body.phone,
          passwordHash: hashedPassword,
          role: 'ADMIN', // Business owner is admin
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
      
      // Create business with owner reference (basic info only)
      const business = await tx.business.create({
        data: {
          name: body.businessName,
          businessType: body.businessType,
          slug: businessSlug,
          ownerId: user.id, // Set business owner
          status: 'PENDING',
          isActive: true
        },
        select: {
          id: true,
          slug: true,
          name: true
        }
      })
      
      // Create business settings with detailed information
      await tx.businessSetting.create({
        data: {
          businessId: business.id,
          description: body.businessDescription || '',
          address: body.businessAddress,
          phone: body.businessPhone || body.phone,
          email: body.email,
          registrationNumber: body.registrationNumber || null,
          currency: 'TZS',
          timezone: 'Africa/Dar_es_Salaam',
          language: 'sw',
          taxRate: 18.0,
          wholesaleMargin: 30.0,
          retailMargin: 50.0,
          financialYearStart: '01-01',
          enableInventoryTracking: true,
          enableCreditSales: false,
          enableLoyaltyProgram: false,
          enableTaxCalculation: true
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