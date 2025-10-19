import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'

const reminderSchema = z.object({
  businessId: z.number(),
  saleIds: z.array(z.number()),
  channel: z.enum(['SMS', 'EMAIL', 'BOTH']),
  message: z.string().min(1)
})

/**
 * POST /api/admin/credit/reminders
 * Send payment reminders to customers for credit sales
 */
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const body = await request.json()
    const validation = reminderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      }, { status: 400 })
    }

    const { businessId, saleIds, channel, message } = validation.data

    // Get sales with customer information
    const sales = await prisma.order.findMany({
      where: {
        id: { in: saleIds },
        businessId
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        payments: true
      }
    })

    if (sales.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No sales found'
      }, { status: 404 })
    }

    // Get business information for message personalization
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        nameSwahili: true
      }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    const remindersSent: Array<{ customerId: number; channel: string; status: string }> = []
    const failedReminders: Array<{ customerId: number; reason: string }> = []

    // Process each sale/customer
    for (const sale of sales) {
      const totalPaid = sale.payments
        .filter(p => p.paymentStatus === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0)
      
      const outstandingBalance = Number(sale.totalAmount) - totalPaid

      // Personalize message
      const personalizedMessage = message
        .replace(/\{\{customer\}\}/g, sale.customer.fullName)
        .replace(/\{\{amount\}\}/g, outstandingBalance.toLocaleString())
        .replace(/\{\{dueDate\}\}/g, sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString() : 'N/A')
        .replace(/\{\{business\}\}/g, business.name)

      try {
        // Send SMS
        if (channel === 'SMS' || channel === 'BOTH') {
          // TODO: Integrate with SMS service (e.g., Africa's Talking, Twilio)
          // For now, we'll just log and mark as sent
          console.log(`SMS to ${sale.customer.phone}: ${personalizedMessage}`)
          
          remindersSent.push({
            customerId: sale.customer.id,
            channel: 'SMS',
            status: 'sent'
          })
        }

        // Send Email
        if (channel === 'EMAIL' || channel === 'BOTH') {
          if (!sale.customer.email) {
            failedReminders.push({
              customerId: sale.customer.id,
              reason: 'No email address'
            })
          } else {
            // TODO: Integrate with email service
            // For now, we'll just log and mark as sent
            console.log(`Email to ${sale.customer.email}: ${personalizedMessage}`)
            
            remindersSent.push({
              customerId: sale.customer.id,
              channel: 'EMAIL',
              status: 'sent'
            })
          }
        }

        // Log reminder in database (optional - create a Reminder model if needed)
        await prisma.notification.create({
          data: {
            businessId,
            type: 'PAYMENT_REMINDER',
            title: 'Payment Reminder',
            message: personalizedMessage,
            read: false
          }
        }).catch(err => {
          console.log('Note: Notification model may not exist yet:', err.message)
        })

      } catch (error) {
        console.error(`Failed to send reminder to customer ${sale.customer.id}:`, error)
        failedReminders.push({
          customerId: sale.customer.id,
          reason: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminders processed for ${sales.length} customer(s)`,
      data: {
        sent: remindersSent.length,
        failed: failedReminders.length,
        details: {
          sent: remindersSent,
          failed: failedReminders
        }
      }
    })

  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to send reminders',
      error: handlePrismaError(error)
    }, { status: 500 })
  }
}

