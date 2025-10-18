import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import prisma from '@/app/lib/prisma'
import { azampayClient } from '@/app/lib/azampay/client'
import { MobileMoneyProvider } from '@/app/lib/azampay/types'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { businessId, planId, phoneNumber, provider } = body

    // Validate required fields
    if (!businessId || !planId || !phoneNumber || !provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: businessId, planId, phoneNumber, provider',
        },
        { status: 400 }
      )
    }

    // Validate business ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    if (business.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage this business' },
        { status: 403 }
      )
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive plan' },
        { status: 400 }
      )
    }

    // Format phone number
    let formattedPhone: string
    try {
      formattedPhone = azampayClient.formatPhoneNumber(phoneNumber)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Invalid phone number format',
        },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = azampayClient.generateReference()

    // Create payment transaction record
    const transaction = await prisma.paymentTransaction.create({
      data: {
        businessId,
        businessSubscriptionId: business.subscription?.id,
        planId,
        amount: plan.priceMonthly,
        currency: 'TZS',
        provider: provider.toUpperCase(),
        status: 'PENDING',
        reference,
        phoneNumber: formattedPhone,
        metadata: {
          userId: session.user.id,
          userEmail: session.user.email,
          planName: plan.name,
          planDisplayName: plan.displayName,
        },
      },
    })

    // Map provider to Azampay format
    let azampayProvider: MobileMoneyProvider
    switch (provider.toUpperCase()) {
      case 'AZAMPESA':
        azampayProvider = MobileMoneyProvider.AZAMPESA
        break
      case 'TIGOPESA':
        azampayProvider = MobileMoneyProvider.TIGOPESA
        break
      case 'AIRTEL':
        azampayProvider = MobileMoneyProvider.AIRTEL
        break
      case 'HALOPESA':
        azampayProvider = MobileMoneyProvider.HALOPESA
        break
      default:
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            failureReason: 'Invalid mobile money provider',
          },
        })
        return NextResponse.json(
          { success: false, error: 'Invalid mobile money provider' },
          { status: 400 }
        )
    }

    // Initiate payment with Azampay
    try {
      const azampayResponse = await azampayClient.initiateMobileCheckout({
        accountNumber: formattedPhone,
        amount: plan.priceMonthly.toString(),
        currency: 'TZS',
        externalId: reference,
        provider: azampayProvider,
        additionalProperties: {
          businessName: business.name,
          planName: plan.displayName,
        },
      })

      // Update transaction with Azampay transaction ID
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          azampayTransactionId: azampayResponse.data,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          transactionId: transaction.id,
          reference,
          azampayTransactionId: azampayResponse.data,
          amount: plan.priceMonthly,
          currency: 'TZS',
          provider,
          phoneNumber: formattedPhone,
          instructions:
            'Please check your phone and enter your PIN to complete the payment.',
        },
        message: 'Payment initiated successfully',
      })
    } catch (error) {
      // Update transaction as failed
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          failureReason:
            error instanceof Error ? error.message : 'Failed to initiate payment with Azampay',
        },
      })

      console.error('Error initiating Azampay payment:', error)
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to initiate payment. Please try again.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in payment initiation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}


