import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../lib/prisma'
import { getAuthContext } from '../../../../lib/rbac/middleware'

// Schema validation ya POS sales data
const posSalesSchema = z.object({
  // Business context
  businessId: z.number().positive('Business ID is required'),
  
  // Customer information  
  customerId: z.number().positive('Customer ID is required'),
  
  // Order items
  items: z.array(z.object({
    productId: z.number().positive('Product ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().nonnegative('Unit price must be non-negative'),
    totalPrice: z.number().nonnegative('Total price must be non-negative')
  })).min(1, 'At least one item is required'),
  
  // Payment information
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CREDIT', 'PARTIAL']),
  paymentPlan: z.enum(['FULL', 'PARTIAL', 'CREDIT']).default('FULL'),
  
  // Amounts
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  taxAmount: z.number().nonnegative('Tax amount must be non-negative').default(0),
  discountAmount: z.number().nonnegative('Discount amount must be non-negative').default(0),
  totalAmount: z.number().nonnegative('Total amount must be non-negative'),
  
  // Payment details
  cashReceived: z.number().nonnegative('Cash received must be non-negative').optional(),
  changeAmount: z.number().nonnegative('Change amount must be non-negative').default(0),
  
  // Partial payment details (optional)
  partialPayment: z.object({
    amountPaid: z.number().nonnegative('Amount paid must be non-negative'),
    dueDate: z.string().min(1, 'Due date is required'),
    percentage: z.number().min(1).max(100, 'Percentage must be between 1-100')
  }).optional(),
  
  // Credit sale details (optional) 
  creditSale: z.object({
    creditPlan: z.string().min(1, 'Credit plan is required'),
    interestRate: z.number().nonnegative('Interest rate must be non-negative').default(0),
    termMonths: z.number().positive('Term months must be positive')
  }).optional(),
  
  // Transaction metadata
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  includeTax: z.boolean().default(false),
  orderType: z.enum(['RETAIL', 'WHOLESALE']).default('RETAIL')
})

/**
 * POST /api/admin/pos/sales
 * Create a new POS sale transaction
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    console.log('POS Sales - Received data:', JSON.stringify(body, null, 2))
    
    const validationResult = posSalesSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('POS Sales - Validation failed:', validationResult.error.format())
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format()
      }, { status: 400 })
    }

    const {
      businessId,
      customerId,
      items,
      paymentMethod,
      paymentPlan,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      cashReceived,
      changeAmount,
      partialPayment,
      transactionId,
      notes,
      orderType,
    } = validationResult.data

    // Verify business exists and user has access
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        isActive: true,
        OR: [
          { ownerId: authContext.userId },
          {
            userPermissions: {
              some: {
                userId: authContext.userId,
                isActive: true,
                permission: {
                  resource: 'pos',
                  action: 'create'
                }
              }
            }
          }
        ]
      },
      include: {
        businessSetting: {
          select: {
            orderPrefix: true,
            taxRate: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found or access denied'
      }, { status: 403 })
    }

    // Verify customer exists in the business
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: businessId,
        isActive: true
      }
    })

    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }

    // Verify all products exist and have sufficient inventory
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: businessId,
        isActive: true
      },
      include: {
        inventory: {
          where: { businessId: businessId }
        }
      }
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({
        success: false,
        message: 'One or more products not found'
      }, { status: 404 })
    }

    // Check inventory availability
    const inventoryIssues: string[] = []
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId)
      if (product?.inventory?.[0]) {
        const availableStock = product.inventory[0].quantity - product.inventory[0].reservedQuantity
        if (availableStock < item.quantity) {
          inventoryIssues.push(`Insufficient stock for ${product.name}. Available: ${availableStock}, Required: ${item.quantity}`)
        }
      }
    })

    if (inventoryIssues.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Inventory issues found',
        errors: inventoryIssues
      }, { status: 400 })
    }

    // Generate unique order number using timestamp-based approach
    const orderPrefix = business.businessSetting?.orderPrefix || 'ORD'
    
    const generateUniqueOrderNumber = (): string => {
      // Use high precision timestamp + random to ensure uniqueness even in concurrent requests
      const now = new Date()
      const timestamp = now.getTime().toString()
      const microseconds = now.getMilliseconds().toString().padStart(3, '0')
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      
      // Format: PREFIX-YYYYMMDD-TIMESTAMP-RANDOM
      const dateStr = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0')
      
      return `${orderPrefix}-${dateStr}-${timestamp.slice(-6)}${microseconds}${random}`
    }

    const orderNumber = generateUniqueOrderNumber()
    
    console.log('POS Sales - Generated order number:', orderNumber)

    // Create order, order items, and payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order with error handling for potential duplicates
      let order
      try {
        order = await tx.order.create({
          data: {
            businessId,
            customerId,
            orderNumber,
            status: 'CONFIRMED',
            orderType: orderType,
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentPlan === 'FULL' ? 'PAID' : paymentPlan === 'PARTIAL' ? 'PARTIAL' : 'PENDING',
            paymentPlan,
            notes,
            orderDate: new Date()
          }
        })
      } catch (error: unknown) {
        // If we get a unique constraint error, generate a new order number with extra randomness
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
            'meta' in error && error.meta && typeof error.meta === 'object' && 
            'target' in error.meta && Array.isArray(error.meta.target) && 
            error.meta.target.includes('order_number')) {
          const fallbackOrderNumber = `${orderPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
          console.log('POS Sales - Order number collision detected, using fallback:', fallbackOrderNumber)
          
          order = await tx.order.create({
            data: {
              businessId,
              customerId,
              orderNumber: fallbackOrderNumber,
              status: 'CONFIRMED',
              orderType: orderType,
              subtotal,
              taxAmount,
              discountAmount,
              totalAmount,
              paymentMethod,
              paymentStatus: paymentPlan === 'FULL' ? 'PAID' : paymentPlan === 'PARTIAL' ? 'PARTIAL' : 'PENDING',
              paymentPlan,
              notes,
              orderDate: new Date()
            }
          })
        } else {
          throw error // Re-throw if it's not a unique constraint error
        }
      }

      // Create order items
      const orderItemsData = items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))

      await tx.orderItem.createMany({
        data: orderItemsData
      })

      // Update inventory - deduct only from retail_store
      for (const item of items) {
        // Check if product exists in retail_store
        const retailInventory = await tx.inventory.findUnique({
          where: {
            businessId_productId_location: {
              businessId,
              productId: item.productId,
              location: 'retail_store'
            }
          }
        })

        if (!retailInventory) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, nameSwahili: true }
          })
          const productName = product?.nameSwahili || product?.name || `Product ${item.productId}`
          throw new Error(`BIDHAA_HAIPO_DUKANI:${productName}`)
        }

        if (retailInventory.quantity < item.quantity) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, nameSwahili: true }
          })
          const productName = product?.nameSwahili || product?.name || `Product ${item.productId}`
          throw new Error(`HISA_HAITOSHI:${productName}:${retailInventory.quantity}:${item.quantity}`)
        }

        // Deduct from retail_store only
        await tx.inventory.update({
          where: {
            businessId_productId_location: {
              businessId,
              productId: item.productId,
              location: 'retail_store'
            }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        })

        // Create movement record for sale
        await tx.inventoryMovement.create({
          data: {
            businessId,
            productId: item.productId,
            fromLocation: 'retail_store',
            toLocation: 'sold', // Sale destination
            quantity: item.quantity,
            movementType: 'sale',
            reason: `Sale - Order ${order.orderNumber}`,
            referenceId: order.orderNumber,
            createdBy: 1 // TODO: Get from auth context
          }
        })
      }

      // Create payment record
      const paymentAmount = paymentPlan === 'PARTIAL' && partialPayment 
        ? partialPayment.amountPaid 
        : totalAmount

      const payment = await tx.payment.create({
        data: {
          businessId,
          orderId: order.id,
          customerId,
          amount: paymentAmount,
          paymentMethod,
          paymentStatus: paymentPlan === 'FULL' ? 'PAID' : paymentPlan === 'PARTIAL' ? 'PARTIAL' : 'PENDING',
          transactionId: transactionId || `TXN-${Date.now()}`,
          reference: orderNumber,
          notes: paymentPlan === 'PARTIAL' ? `Partial payment: ${partialPayment?.percentage}%` : undefined,
          paidAt: paymentPlan !== 'CREDIT' ? new Date() : undefined
        }
      })


      return {
        order,
        payment,
        orderItems: orderItemsData
      }
    })

    console.log('POS Sales - Transaction created successfully:', result.order.id)

    return NextResponse.json({
      success: true,
      message: 'Sale completed successfully',
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        transactionId: result.payment.transactionId,
        totalAmount: result.order.totalAmount,
        paymentStatus: result.order.paymentStatus,
        cashReceived,
        changeAmount,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('POS Sales - Error creating sale:', error)
    
    // Handle custom business logic errors with user-friendly messages
    if (error instanceof Error) {
      const errorMessage = error.message
      
      // Product not available in retail store
      if (errorMessage.startsWith('BIDHAA_HAIPO_DUKANI:')) {
        const productName = errorMessage.split(':')[1]
        return NextResponse.json({
          success: false,
          message: 'Product not available in retail location',
          errorType: 'PRODUCT_NOT_IN_RETAIL',
          productName
        }, { status: 400 })
      }
      
      // Insufficient stock
      if (errorMessage.startsWith('HISA_HAITOSHI:')) {
        const [, productName, available, requested] = errorMessage.split(':')
        return NextResponse.json({
          success: false,
          message: 'Insufficient stock in retail location',
          errorType: 'INSUFFICIENT_STOCK',
          productName,
          available: parseInt(available),
          requested: parseInt(requested)
        }, { status: 400 })
      }
    }
    
    // Default Prisma error handling
    const prismaError = handlePrismaError(error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process sale',
      error: prismaError.message
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/pos/sales
 * Get POS sales history (for reporting)
 */
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom)
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo)
    }

    const orders = await prisma.order.findMany({
      where: {
        businessId: parseInt(businessId),
        // Show all order types in POS sales history
        ...(Object.keys(dateFilter).length > 0 && {
          orderDate: dateFilter
        })
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameSwahili: true
              }
            }
          }
        },
        payments: true
      },
      orderBy: {
        orderDate: 'desc'
      },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.order.count({
      where: {
        businessId: parseInt(businessId),
        // Count all order types
        ...(Object.keys(dateFilter).length > 0 && {
          orderDate: dateFilter
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sales: orders,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })

  } catch (error) {
    const prismaError = handlePrismaError(error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch sales data',
      error: prismaError.message
    }, { status: 500 })
  }
}
