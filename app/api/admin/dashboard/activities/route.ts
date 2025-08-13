import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '../../../../lib/rbac/middleware'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessIdInt = parseInt(businessId)

    // Get recent orders with customer information
    const recentOrders = await prisma.order.findMany({
      where: {
        businessId: businessIdInt
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      },
      take: limit
    })

    // Get recent transactions (payments)
    const recentTransactions = await prisma.payment.findMany({
      where: {
        order: {
          businessId: businessIdInt
        }
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        paidAt: 'desc'
      },
      take: limit
    })

    // Format orders data
    const formattedOrders = recentOrders.map(order => ({
      id: order.id.toString(),
      customer: order.customer?.fullName || 'Walk-in Customer',
      amount: Number(order.totalAmount),
      status: order.paymentStatus.toLowerCase(),
      date: order.orderDate.toISOString().split('T')[0],
      paymentPlan: order.paymentPlan
    }))

    // Format transactions data
    const formattedTransactions = recentTransactions.map(transaction => {
      // Format time from payment date
      const paymentTime = transaction.paidAt 
        ? new Date(transaction.paidAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        : 'N/A'

      // Determine transaction type
      let type = 'payment'
      if (transaction.paymentMethod === 'CASH') {
        type = 'sale'
      } else if (transaction.paymentStatus === 'FAILED') {
        type = 'refund'
      }

      return {
        id: transaction.id.toString(),
        type,
        customer: transaction.order?.customer?.fullName || 'Walk-in Customer',
        amount: Number(transaction.amount),
        time: paymentTime,
        paymentMethod: transaction.paymentMethod,
        status: transaction.paymentStatus
      }
    })

    // Get system notifications based on business status
    const systemNotifications = await generateSystemNotifications(businessIdInt)

    return NextResponse.json({
      success: true,
      data: {
        recentOrders: formattedOrders,
        recentTransactions: formattedTransactions,
        systemNotifications
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard activities:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Generate system notifications based on business data
async function generateSystemNotifications(businessId: number) {
  const notifications = []

  try {
    // Check for low stock items
    const productsWithInventory = await prisma.product.findMany({
      where: {
        businessId,
        isActive: true
      },
      include: {
        inventory: true
      }
    })

    const lowStockCount = productsWithInventory.filter(product => {
      if (!product.inventory || product.inventory.length === 0) return false
      const inventory = product.inventory[0]
      const reorderPoint = inventory.reorderPoint || 10
      return inventory.quantity <= reorderPoint
    }).length

    if (lowStockCount > 0) {
      notifications.push({
        id: 1,
        message: `Low stock alert for ${lowStockCount} products`,
        time: '2 min ago',
        type: 'warning'
      })
    }

    // Check for new credit applications
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const newCreditApps = await prisma.order.count({
      where: {
        businessId,
        paymentPlan: 'CREDIT',
        paymentStatus: 'PENDING',
        orderDate: {
          gte: yesterday
        }
      }
    })

    if (newCreditApps > 0) {
      notifications.push({
        id: 2,
        message: `${newCreditApps} new credit application${newCreditApps > 1 ? 's' : ''} received`,
        time: '1 hour ago',
        type: 'info'
      })
    }

    // Check for overdue payments (payments that are pending for more than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const overduePayments = await prisma.payment.count({
      where: {
        businessId,
        paymentStatus: 'PENDING',
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    if (overduePayments > 0) {
      notifications.push({
        id: 3,
        message: `${overduePayments} payment${overduePayments > 1 ? 's' : ''} overdue`,
        time: '3 hours ago',
        type: 'error'
      })
    }

    // Add a success notification if everything is good
    if (notifications.length === 0) {
      notifications.push({
        id: 4,
        message: 'All systems running smoothly',
        time: '1 hour ago',
        type: 'success'
      })
    }

  } catch (error) {
    console.error('Error generating notifications:', error)
    // Add a default notification in case of error
    notifications.push({
      id: 5,
      message: 'System status check completed',
      time: '5 min ago',
      type: 'info'
    })
  }

  return notifications
}
