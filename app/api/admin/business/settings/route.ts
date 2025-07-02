import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../lib/rbac/permissions'

/**
 * GET /api/admin/business/settings
 * Get business settings for the current user's business
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Get businessId from query parameters
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission to read business settings
    const hasAccess = await hasPermission(authContext, Resource.BUSINESS, Action.READ, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view business settings'
      }, { status: 403 })
    }

    // Get business with settings
    const business = await prisma.business.findUnique({
      where: {
        id: businessIdNum
      },
      include: {
        businessSetting: true
      }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Prepare response data
    const data = {
      // Basic business info
      businessName: business.name,
      businessType: business.businessType,
      
      // Contact Information
      description: business.businessSetting?.description || '',
      email: business.businessSetting?.email || '',
      phone: business.businessSetting?.phone || '',
      website: business.businessSetting?.website || '',
      
      // Address Information  
      address: business.businessSetting?.address || '',
      city: business.businessSetting?.city || '',
      region: business.businessSetting?.region || '',
      country: business.businessSetting?.country || 'Tanzania',
      postalCode: business.businessSetting?.postalCode || '',
      
      // Business Details
      registrationNumber: business.businessSetting?.registrationNumber || '',
      currency: business.businessSetting?.currency || 'TZS',
      timezone: business.businessSetting?.timezone || 'Africa/Dar_es_Salaam',
      language: business.businessSetting?.language || 'en',
      
      // Financial Settings
      wholesaleMargin: Number(business.businessSetting?.wholesaleMargin) || 30,
      retailMargin: Number(business.businessSetting?.retailMargin) || 50,
      taxRate: Number(business.businessSetting?.taxRate) || 18,
      financialYearStart: business.businessSetting?.financialYearStart || '01-01',
      
      // Visual Settings
      logoUrl: business.businessSetting?.logoUrl || '',
      primaryColor: business.businessSetting?.primaryColor || '',
      secondaryColor: business.businessSetting?.secondaryColor || '',
      
      // Feature Toggles
      enableMultiCurrency: business.businessSetting?.enableMultiCurrency || false,
      enableTaxCalculation: business.businessSetting?.enableTaxCalculation || true,
      enableInventoryTracking: business.businessSetting?.enableInventoryTracking || true,
      enableCreditSales: business.businessSetting?.enableCreditSales || false,
      enableLoyaltyProgram: business.businessSetting?.enableLoyaltyProgram || false,
      enableMultiLocation: business.businessSetting?.enableMultiLocation || false,
      
      // Operational Settings
      defaultPaymentMethod: business.businessSetting?.defaultPaymentMethod || 'CASH',
      paymentMethods: business.businessSetting?.paymentMethods || [
        { value: 'cash', label: 'Cash', labelSwahili: 'Fedha Taslimu', icon: 'BanknotesIcon' },
        { value: 'card', label: 'Card', labelSwahili: 'Kadi', icon: 'CreditCardIcon' },
        { value: 'mobile', label: 'Mobile Money', labelSwahili: 'Fedha za Simu', icon: 'DevicePhoneMobileIcon' },
        { value: 'bank', label: 'Bank Transfer', labelSwahili: 'Uhamisho wa Benki', icon: 'BuildingLibraryIcon' }
      ],
      invoicePrefix: business.businessSetting?.invoicePrefix || 'INV',
      orderPrefix: business.businessSetting?.orderPrefix || 'ORD',
      receiptFooterMessage: business.businessSetting?.receiptFooterMessage || ''
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching business settings:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch business settings'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/business/settings  
 * Update business settings for the current user's business
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const {
      businessId,
      businessName,
      businessType,
      ...settingsData
    } = body

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission to update business settings
    const hasAccess = await hasPermission(authContext, Resource.BUSINESS, Action.UPDATE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update business settings'
      }, { status: 403 })
    }

    // Update business core fields (name and type only)
    if (businessName !== undefined || businessType !== undefined) {
      const businessUpdateData: { name?: string; businessType?: string } = {}
      if (businessName !== undefined) businessUpdateData.name = businessName
      if (businessType !== undefined) businessUpdateData.businessType = businessType

      await prisma.business.update({
        where: {
          id: businessIdNum
        },
        data: businessUpdateData
      })
    }

    // Prepare business settings data
    const businessSettingsData = {
      // Contact Information
      description: settingsData.description,
      email: settingsData.email,
      phone: settingsData.phone,
      website: settingsData.website,
      
      // Address Information
      address: settingsData.address,
      city: settingsData.city,
      region: settingsData.region,
      country: settingsData.country,
      postalCode: settingsData.postalCode,
      
      // Business Details
      registrationNumber: settingsData.registrationNumber,
      currency: settingsData.currency,
      timezone: settingsData.timezone,
      language: settingsData.language,
      
      // Financial Settings
      wholesaleMargin: settingsData.wholesaleMargin ? Number(settingsData.wholesaleMargin) : undefined,
      retailMargin: settingsData.retailMargin ? Number(settingsData.retailMargin) : undefined,
      taxRate: settingsData.taxRate ? Number(settingsData.taxRate) : undefined,
      financialYearStart: settingsData.financialYearStart,
      
      // Visual Settings
      logoUrl: settingsData.logoUrl,
      primaryColor: settingsData.primaryColor,
      secondaryColor: settingsData.secondaryColor,
      
      // Feature Toggles
      enableMultiCurrency: settingsData.enableMultiCurrency,
      enableTaxCalculation: settingsData.enableTaxCalculation,
      enableInventoryTracking: settingsData.enableInventoryTracking,
      enableCreditSales: settingsData.enableCreditSales,
      enableLoyaltyProgram: settingsData.enableLoyaltyProgram,
      enableMultiLocation: settingsData.enableMultiLocation,
      
      // Operational Settings
      defaultPaymentMethod: settingsData.defaultPaymentMethod,
      invoicePrefix: settingsData.invoicePrefix,
      orderPrefix: settingsData.orderPrefix,
      receiptFooterMessage: settingsData.receiptFooterMessage
    }

    // Remove undefined values
    Object.keys(businessSettingsData).forEach(key => {
      if (businessSettingsData[key as keyof typeof businessSettingsData] === undefined) {
        delete businessSettingsData[key as keyof typeof businessSettingsData]
      }
    })

    // Upsert business settings
    await prisma.businessSetting.upsert({
      where: {
        businessId: businessIdNum
      },
      update: businessSettingsData,
      create: {
        businessId: businessIdNum,
        ...businessSettingsData
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Business settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating business settings:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update business settings'
    }, { status: 500 })
  }
} 