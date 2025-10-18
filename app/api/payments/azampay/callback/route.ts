import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { activateSubscription } from '@/app/lib/subscription/manager'
import { AzampayWebhookPayload } from '@/app/lib/azampay/types'

export async function POST(req: NextRequest) {
  try {
    const body: AzampayWebhookPayload = await req.json()

    console.log('Received Azampay webhook:', body)

    const { transactionId, status, externalId, reason } = body

    if (!transactionId || !externalId) {
      return NextResponse.json(
        { success: false, error: 'Missing required webhook data' },
        { status: 400 }
      )
    }

    // Find the payment transaction by reference (externalId)
    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        reference: externalId,
      },
      include: {
        plan: true,
      },
    })

    if (!transaction) {
      console.error('Transaction not found for reference:', externalId)
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Map Azampay status to our status
    let paymentStatus: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING' = 'PENDING'
    
    if (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'SUCCESSFUL') {
      paymentStatus = 'SUCCESS'
    } else if (status.toUpperCase() === 'FAILED') {
      paymentStatus = 'FAILED'
    } else if (status.toUpperCase() === 'CANCELLED' || status.toUpperCase() === 'CANCELED') {
      paymentStatus = 'CANCELLED'
    }

    // Update transaction status
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: paymentStatus,
        azampayTransactionId: transactionId,
        completedAt: paymentStatus === 'SUCCESS' ? new Date() : null,
        failureReason: paymentStatus !== 'SUCCESS' ? reason : null,
      },
    })

    // If payment was successful, activate/renew subscription
    if (paymentStatus === 'SUCCESS') {
      try {
        const activationResult = await activateSubscription(
          transaction.businessId,
          transaction.planId,
          'MONTHLY'
        )

        if (!activationResult.success) {
          console.error(
            'Failed to activate subscription after successful payment:',
            activationResult.error
          )
          
          // Log this error but don't fail the webhook response
          // We can manually activate later if needed
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              metadata: {
                ...(transaction.metadata as object),
                activationError: activationResult.error,
                activationAttempted: new Date().toISOString(),
              },
            },
          })
        } else {
          console.log(
            `Subscription activated successfully for business ${transaction.businessId}`
          )
        }
      } catch (error) {
        console.error('Error activating subscription:', error)
        // Don't fail the webhook - we'll handle this manually if needed
      }
    }

    // Return success to Azampay
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        reference: externalId,
        status: paymentStatus,
      },
    })
  } catch (error) {
    console.error('Error processing Azampay webhook:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Allow Azampay to POST without authentication
export const dynamic = 'force-dynamic'


