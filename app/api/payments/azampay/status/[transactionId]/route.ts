import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth-config'
import prisma from '@/app/lib/prisma'
import { azampayClient } from '@/app/lib/azampay/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transactionId = parseInt(params.transactionId)

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      )
    }

    // Get transaction from database
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        plan: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this business
    const business = await prisma.business.findUnique({
      where: { id: transaction.businessId },
    })

    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // If transaction is still pending and has an Azampay transaction ID, check status with Azampay
    if (transaction.status === 'PENDING' && transaction.azampayTransactionId) {
      try {
        const azampayStatus = await azampayClient.checkPaymentStatus(
          transaction.azampayTransactionId
        )

        // Update transaction status if it has changed
        if (azampayStatus.success && azampayStatus.data.status) {
          let newStatus: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING' = 'PENDING'

          const azampayStatusUpper = azampayStatus.data.status.toUpperCase()
          if (azampayStatusUpper === 'SUCCESS' || azampayStatusUpper === 'SUCCESSFUL') {
            newStatus = 'SUCCESS'
          } else if (azampayStatusUpper === 'FAILED') {
            newStatus = 'FAILED'
          } else if (azampayStatusUpper === 'CANCELLED' || azampayStatusUpper === 'CANCELED') {
            newStatus = 'CANCELLED'
          }

          if (newStatus !== transaction.status) {
            await prisma.paymentTransaction.update({
              where: { id: transaction.id },
              data: {
                status: newStatus,
                completedAt: newStatus === 'SUCCESS' ? new Date() : null,
                failureReason: newStatus !== 'SUCCESS' ? azampayStatus.data.reason : null,
              },
            })

            // Return updated status
            return NextResponse.json({
              success: true,
              data: {
                transactionId: transaction.id,
                reference: transaction.reference,
                status: newStatus,
                amount: transaction.amount,
                currency: transaction.currency,
                provider: transaction.provider,
                phoneNumber: transaction.phoneNumber,
                planName: transaction.plan.displayName,
                initiatedAt: transaction.initiatedAt,
                completedAt: newStatus === 'SUCCESS' ? new Date() : null,
                failureReason: newStatus !== 'SUCCESS' ? azampayStatus.data.reason : null,
              },
            })
          }
        }
      } catch (error) {
        console.error('Error checking Azampay payment status:', error)
        // Continue with database status if Azampay check fails
      }
    }

    // Return current status from database
    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        provider: transaction.provider,
        phoneNumber: transaction.phoneNumber,
        planName: transaction.plan.displayName,
        initiatedAt: transaction.initiatedAt,
        completedAt: transaction.completedAt,
        failureReason: transaction.failureReason,
      },
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}


