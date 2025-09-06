import { NextRequest, NextResponse } from 'next/server'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'

/**
 * POST /api/admin/business/create
 * Create a new business with business settings
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    console.log('Auth context:', authContext)
    
    if (!authContext) {
      console.log('No auth context - returning 401')
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received body:', body)
    
    const {
      // Basic Business Info
      name,
      businessType,
      slug,
      
      // Business Settings
      description,
      email,
      phone,
      website,
      address,
      city,
      region,
      country = 'Tanzania',
      postalCode,
      registrationNumber,
      
      // Financial Settings
      currency = 'TZS',
      wholesaleMargin = 30,
      retailMargin = 50,
      taxRate = 18,
      
      // Feature Toggles
      enableTaxCalculation = true,
      enableInventoryTracking = true,
      enableCreditSales = false,
      enableLoyaltyProgram = false
    } = body

    console.log('Parsed data:', { name, businessType, slug, wholesaleMargin, retailMargin, taxRate })

    // Validate required fields
    if (!name || !businessType || !slug) {
      console.log('Missing required fields:', { name: !!name, businessType: !!businessType, slug: !!slug })
      return NextResponse.json({
        success: false,
        message: 'Name, business type, and slug are required'
      }, { status: 400 })
    }

    // Check if slug already exists
    const existingSlug = await prisma.business.findUnique({
      where: { slug }
    })

    if (existingSlug) {
      console.log('Slug already exists:', slug)
      return NextResponse.json({
        success: false,
        message: 'Business slug already exists'
      }, { status: 400 })
    }

    // Create business with business settings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the business
      const business = await tx.business.create({
        data: {
          name,
          businessType,
          slug,
          ownerId: authContext.userId,
          status: 'ACTIVE',
          isActive: true
        }
      })

      console.log('Business created:', business.id)

      // Add owner to BusinessUser table as ADMIN
      await tx.businessUser.create({
        data: {
          businessId: business.id,
          userId: authContext.userId,
          role: 'ADMIN',
          isActive: true,
          addedBy: authContext.userId 
        }
      })

      console.log('Owner added to BusinessUser table')

      // Create business settings
      const businessSettings = await tx.businessSetting.create({
        data: {
          businessId: business.id,
          description,
          email,
          phone,
          website,
          address,
          city,
          region,
          country,
          postalCode,
          registrationNumber,
          currency,
          wholesaleMargin: wholesaleMargin ? Number(wholesaleMargin) : 30,
          retailMargin: retailMargin ? Number(retailMargin) : 50,
          taxRate: taxRate ? Number(taxRate) : 18,
          enableTaxCalculation,
          enableInventoryTracking,
          enableCreditSales,
          enableLoyaltyProgram
        }
      })

      console.log('Business settings created:', businessSettings.id)

      return { business, businessSettings }
    })

    return NextResponse.json({
      success: true,
      message: 'Business created successfully',
      data: {
        business: result.business,
        settings: result.businessSettings
      }
    })

  } catch (error) {
    console.error('Error creating business:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
} 