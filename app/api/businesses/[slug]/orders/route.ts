import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, handlePrismaError } from '../../../../lib/prisma'

// Order submission schema
const orderSubmissionSchema = z.object({
  // Customer Information
  customerInfo: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().optional().or(z.literal('')),
    address: z.string().optional(),
    specialInstructions: z.string().optional()
  }),
  
  // Order Items
  orderItems: z.array(z.object({
    productId: z.number().or(z.string().transform(Number)),
    quantity: z.number().min(1),
    price: z.number().or(z.string().transform(Number)).refine(val => val >= 0, 'Price must be non-negative'),
    subtotal: z.number().or(z.string().transform(Number)).refine(val => val >= 0, 'Subtotal must be non-negative')
  })).min(1, 'At least one order item is required'),
  
  // Payment and Delivery
  paymentMethod: z.enum(['full', 'partial', 'credit']),
  deliveryOption: z.string(),
  deliveryFee: z.number().min(0),
  
  // Payment-specific data
  partialPayment: z.object({
    amountToPay: z.number().min(0),
    dueDate: z.string(),
    paymentTerms: z.string()
  }).optional(),
  
  creditPurchase: z.object({
    selectedPlan: z.string(),
    verificationData: z.object({
      fullName: z.string(),
      phone: z.string(),
      idNumber: z.string(),
      monthlyIncome: z.string()
    }),
    customerType: z.enum(['individual', 'business']).default('individual')
  }).optional(),
  
  // Totals
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0)
})

/**
 * POST /api/businesses/[slug]/orders
 * Submit a customer order
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params in Next.js 15
    const params = await context.params
    
    // Get business from slug
    const business = await prisma.business.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        businessSetting: {
          select: {
            taxRate: true,
            enableCreditSales: true,
            creditTerms: true,
            orderPrefix: true
          }
        }
      }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    console.log('Received order data:', JSON.stringify(body, null, 2))
    
    const validationResult = orderSubmissionSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.format())
      console.error('Validation issues:', validationResult.error.issues)
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.format(),
        issues: validationResult.error.issues
      }, { status: 400 })
    }

    const { 
      customerInfo, 
      orderItems, 
      paymentMethod, 
      deliveryOption,
      deliveryFee,
      partialPayment,
      creditPurchase,
      subtotal,
      taxAmount,
      totalAmount 
    } = validationResult.data

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create customer in this business
      let customer = await tx.customer.findFirst({
        where: {
          businessId: business.id,
          phone: customerInfo.phone
        }
      })

      if (!customer) {
        // Create new customer for this business
        const nameParts = customerInfo.fullName.split(' ')
        const firstName = nameParts[0] || customerInfo.fullName
        const lastName = nameParts.slice(1).join(' ') || ''

        customer = await tx.customer.create({
          data: {
            businessId: business.id,
            fullName: customerInfo.fullName,
            firstName,
            lastName,
            email: customerInfo.email && customerInfo.email !== '' ? customerInfo.email : null,
            phone: customerInfo.phone,
            customerType: creditPurchase?.customerType === 'business' ? 'BUSINESS' : 'INDIVIDUAL'
          }
        })
      } else {
        // Update customer info if needed
        const updateData: {
          email?: string | null
          fullName?: string
          firstName?: string
          lastName?: string
        } = {}
        if (customerInfo.email && customerInfo.email !== '' && !customer.email) {
          updateData.email = customerInfo.email
        }
        if (customerInfo.fullName !== customer.fullName) {
          updateData.fullName = customerInfo.fullName
          const nameParts = customerInfo.fullName.split(' ')
          updateData.firstName = nameParts[0] || customerInfo.fullName
          updateData.lastName = nameParts.slice(1).join(' ') || ''
        }
        
        if (Object.keys(updateData).length > 0) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: updateData
          })
        }
      }

      // 3. Generate order number
      const orderPrefix = business.businessSetting?.orderPrefix ?? 'ORD'
      const orderNumber = `${orderPrefix}${Date.now()}`

      // 4. Determine payment method enum value
      let paymentMethodEnum: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CREDIT' | 'PARTIAL'
      switch (paymentMethod) {
        case 'credit':
          paymentMethodEnum = 'CREDIT'
          break
        case 'partial':
          paymentMethodEnum = 'PARTIAL'
          break
        case 'full':
        default:
          paymentMethodEnum = 'CASH'
      }

      // 5. Create the order
      const order = await tx.order.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          orderNumber,
          status: 'PENDING',
          orderType: 'RETAIL',
          subtotal: subtotal,
          taxAmount: taxAmount,
          totalAmount: totalAmount + deliveryFee,
          paymentMethod: paymentMethodEnum,
          paymentStatus: paymentMethod === 'credit' ? 'PENDING' : 
                        paymentMethod === 'partial' ? 'PARTIAL' : 'PENDING',
          notes: customerInfo.specialInstructions || null,
          deliveryAddress: deliveryOption === 'delivery' ? customerInfo.address : null
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      })

      // 6. Create order items
      const orderItemsData = orderItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.subtotal
      }))

      await tx.orderItem.createMany({
        data: orderItemsData
      })

      // 7. Handle credit purchase
      if (paymentMethod === 'credit' && creditPurchase) {
        // Get credit terms from business settings
        const creditTerms = (business.businessSetting?.creditTerms as Array<{months: number, interestRate: number, enabled: boolean}>) || []
        const selectedCreditTerm = creditTerms.find(term => term.months.toString() === creditPurchase.selectedPlan)
        
        if (!selectedCreditTerm) {
          throw new Error('Invalid credit plan selected')
        }

        // Generate application number
        const applicationNumber = `CA${Date.now()}`

        // Create credit application
        await tx.creditApplication.create({
          data: {
            businessId: business.id,
            customerId: customer.id,
            orderId: order.id,
            applicationNumber,
            customerType: creditPurchase.customerType === 'business' ? 'BUSINESS' : 'INDIVIDUAL',
            requestedAmount: totalAmount + deliveryFee,
            interestRate: selectedCreditTerm.interestRate,
            termMonths: selectedCreditTerm.months,
            status: 'PENDING',
            employmentInfo: creditPurchase.customerType === 'individual' ? {
              fullName: creditPurchase.verificationData.fullName,
              phone: creditPurchase.verificationData.phone,
              idNumber: creditPurchase.verificationData.idNumber,
              monthlyIncome: creditPurchase.verificationData.monthlyIncome
            } : undefined,
            businessInfo: creditPurchase.customerType === 'business' ? {
              fullName: creditPurchase.verificationData.fullName,
              phone: creditPurchase.verificationData.phone,
              idNumber: creditPurchase.verificationData.idNumber,
              monthlyIncome: creditPurchase.verificationData.monthlyIncome
            } : undefined
          }
        })
      }

      // 8. Handle partial payment
      if (paymentMethod === 'partial' && partialPayment) {
        // Create initial payment record
        await tx.payment.create({
          data: {
            businessId: business.id,
            orderId: order.id,
            customerId: customer.id,
            amount: partialPayment.amountToPay,
            paymentMethod: 'CASH',
            paymentStatus: 'PENDING',
            notes: `Partial payment - Balance due: ${new Date(partialPayment.dueDate).toLocaleDateString()}`
          }
        })
      }

      return {
        order,
        customer,
        orderNumber
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Order submitted successfully',
      data: {
        orderNumber: result.orderNumber,
        orderId: result.order.id,
        customer: result.customer,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        paymentMethod: paymentMethod,
        ...(paymentMethod === 'credit' && {
          creditApplicationStatus: 'PENDING',
          message: 'Credit application has been submitted for review'
        }),
        ...(paymentMethod === 'partial' && partialPayment && {
          partialPaymentAmount: partialPayment.amountToPay,
          balanceDue: totalAmount + deliveryFee - partialPayment.amountToPay,
          dueDate: partialPayment.dueDate
        })
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting order:', error)
    const prismaError = handlePrismaError(error)
    return NextResponse.json({
      success: false,
      message: prismaError.message
    }, { status: 500 })
  }
} 