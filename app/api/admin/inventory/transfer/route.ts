import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'

const transferSchema = z.object({
  businessId: z.number(),
  transfers: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    reason: z.string().optional()
  })),
  fromLocation: z.string().min(1),
  toLocation: z.string().min(1),
  createdBy: z.number()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = transferSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid data provided',
        errors: validationResult.error.errors
      }, { status: 400 })
    }

    const { businessId, transfers, fromLocation, toLocation, createdBy } = validationResult.data

    // Validate business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        message: 'Business not found'
      }, { status: 404 })
    }

    // Validate user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: createdBy }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Validate locations
    if (fromLocation === toLocation) {
      return NextResponse.json({
        success: false,
        message: 'Source and destination locations cannot be the same'
      }, { status: 400 })
    }

    const validLocations = ['main_store', 'retail_store']
    if (!validLocations.includes(fromLocation) || !validLocations.includes(toLocation)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid location. Valid locations are: main_store, retail_store'
      }, { status: 400 })
    }

    // Process transfers in transaction
    const result = await prisma.$transaction(async (tx) => {
      const transferResults = []
      const movementRecords = []

      for (const transfer of transfers) {
        // Check source inventory availability
        const sourceInventory = await tx.inventory.findUnique({
          where: {
            businessId_productId_location: {
              businessId,
              productId: transfer.productId,
              location: fromLocation
            }
          }
        })

        if (!sourceInventory) {
          throw new Error(`Product ${transfer.productId} not found in ${fromLocation}`)
        }

        if (sourceInventory.quantity < transfer.quantity) {
          const product = await tx.product.findUnique({
            where: { id: transfer.productId },
            select: { name: true }
          })
          throw new Error(`Insufficient stock for ${product?.name}. Available: ${sourceInventory.quantity}, Requested: ${transfer.quantity}`)
        }

        // Decrease source inventory
        await tx.inventory.update({
          where: {
            businessId_productId_location: {
              businessId,
              productId: transfer.productId,
              location: fromLocation
            }
          },
          data: {
            quantity: {
              decrement: transfer.quantity
            }
          }
        })

        // Increase destination inventory (create if doesn't exist)
        await tx.inventory.upsert({
          where: {
            businessId_productId_location: {
              businessId,
              productId: transfer.productId,
              location: toLocation
            }
          },
          create: {
            businessId,
            productId: transfer.productId,
            location: toLocation,
            quantity: transfer.quantity
          },
          update: {
            quantity: {
              increment: transfer.quantity
            }
          }
        })

        // Create movement record
        const movementRecord = await tx.inventoryMovement.create({
          data: {
            businessId,
            productId: transfer.productId,
            fromLocation,
            toLocation,
            quantity: transfer.quantity,
            movementType: 'transfer',
            reason: transfer.reason || `Transfer from ${fromLocation} to ${toLocation}`,
            createdBy
          }
        })

        transferResults.push({
          productId: transfer.productId,
          quantity: transfer.quantity,
          fromLocation,
          toLocation,
          movementId: movementRecord.id
        })

        movementRecords.push(movementRecord)
      }

      return {
        transfers: transferResults,
        movements: movementRecords,
        totalTransfers: transfers.length
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${result.totalTransfers} product(s) from ${fromLocation} to ${toLocation}`,
      data: result
    })

  } catch (error) {
    console.error('Error processing stock transfer:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 })
  }
}
