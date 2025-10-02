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
  // Support both legacy location strings and new store IDs
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  fromStoreId: z.number().optional(),
  toStoreId: z.number().optional(),
  // For external movements (when product goes outside the business)
  isExternalMovement: z.boolean().default(false),
  externalDestination: z.string().optional(), // Customer name, business name, etc.
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

    const { 
      businessId, 
      transfers, 
      fromLocation, 
      toLocation, 
      fromStoreId, 
      toStoreId, 
      isExternalMovement,
      externalDestination,
      createdBy 
    } = validationResult.data

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

    // Determine source and destination
    let sourceLocation: string
    let destinationLocation: string
    let sourceStoreId: number | null = null
    let destinationStoreId: number | null = null

    // Handle source (fromLocation or fromStoreId)
    if (fromStoreId) {
      const sourceStore = await prisma.store.findFirst({
        where: { id: fromStoreId, businessId, isActive: true }
      })
      if (!sourceStore) {
        return NextResponse.json({
          success: false,
          message: 'Source store not found'
        }, { status: 404 })
      }
      sourceLocation = `store_${fromStoreId}`
      sourceStoreId = fromStoreId
    } else if (fromLocation) {
      sourceLocation = fromLocation
      // Legacy support for hardcoded locations
      const validLocations = ['main_store', 'retail_store']
      if (!validLocations.includes(fromLocation)) {
        return NextResponse.json({
          success: false,
          message: 'Invalid source location'
        }, { status: 400 })
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Source location or store ID is required'
      }, { status: 400 })
    }

    // Handle destination
    if (isExternalMovement) {
      if (!externalDestination) {
        return NextResponse.json({
          success: false,
          message: 'External destination is required for external movements'
        }, { status: 400 })
      }
      destinationLocation = `external_${externalDestination.replace(/\s+/g, '_').toLowerCase()}`
    } else if (toStoreId) {
      const destinationStore = await prisma.store.findFirst({
        where: { id: toStoreId, businessId, isActive: true }
      })
      if (!destinationStore) {
        return NextResponse.json({
          success: false,
          message: 'Destination store not found'
        }, { status: 404 })
      }
      destinationLocation = `store_${toStoreId}`
      destinationStoreId = toStoreId
    } else if (toLocation) {
      destinationLocation = toLocation
      // Legacy support for hardcoded locations
      const validLocations = ['main_store', 'retail_store']
      if (!validLocations.includes(toLocation)) {
        return NextResponse.json({
          success: false,
          message: 'Invalid destination location'
        }, { status: 400 })
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Destination location, store ID, or external movement flag is required'
      }, { status: 400 })
    }

    // Validate not transferring to same location
    if (sourceLocation === destinationLocation) {
      return NextResponse.json({
        success: false,
        message: 'Source and destination cannot be the same'
      }, { status: 400 })
    }

    // Process transfers in transaction
    const result = await prisma.$transaction(async (tx) => {
      const transferResults = []
      const movementRecords = []

      for (const transfer of transfers) {
        // Find source inventory (support both legacy location and new store-based)
        let sourceInventory
        if (sourceStoreId) {
          // New store-based inventory
          sourceInventory = await tx.inventory.findFirst({
            where: {
              businessId,
              productId: transfer.productId,
              storeId: sourceStoreId
            }
          })
        } else {
          // Legacy location-based inventory
          sourceInventory = await tx.inventory.findUnique({
            where: {
              businessId_productId_location: {
                businessId,
                productId: transfer.productId,
                location: sourceLocation
              }
            }
          })
        }

        if (!sourceInventory) {
          const product = await tx.product.findUnique({
            where: { id: transfer.productId },
            select: { name: true }
          })
          throw new Error(`Product ${product?.name} not found in source location`)
        }

        if (sourceInventory.quantity < transfer.quantity) {
          const product = await tx.product.findUnique({
            where: { id: transfer.productId },
            select: { name: true }
          })
          throw new Error(`Insufficient stock for ${product?.name}. Available: ${sourceInventory.quantity}, Requested: ${transfer.quantity}`)
        }

        // Decrease source inventory
        if (sourceStoreId) {
          await tx.inventory.update({
            where: { id: sourceInventory.id },
            data: {
              quantity: {
                decrement: transfer.quantity
              }
            }
          })
        } else {
          await tx.inventory.update({
            where: {
              businessId_productId_location: {
                businessId,
                productId: transfer.productId,
                location: sourceLocation
              }
            },
            data: {
              quantity: {
                decrement: transfer.quantity
              }
            }
          })
        }

        // For external movements, don't create destination inventory
        if (!isExternalMovement) {
          // Increase destination inventory (create if doesn't exist)
          if (destinationStoreId) {
            // New store-based inventory
            await tx.inventory.upsert({
              where: {
                businessId_productId_location: {
                  businessId,
                  productId: transfer.productId,
                  location: destinationLocation
                }
              },
              update: {
                quantity: {
                  increment: transfer.quantity
                }
              },
              create: {
                businessId,
                productId: transfer.productId,
                location: destinationLocation,
                quantity: transfer.quantity,
                storeId: destinationStoreId
              }
            })
          } else {
            // Legacy location-based inventory
            await tx.inventory.upsert({
              where: {
                businessId_productId_location: {
                  businessId,
                  productId: transfer.productId,
                  location: destinationLocation
                }
              },
              update: {
                quantity: {
                  increment: transfer.quantity
                }
              },
              create: {
                businessId,
                productId: transfer.productId,
                location: destinationLocation,
                quantity: transfer.quantity
              }
            })
          }
        }

        // Create movement record
        const movementRecord = await tx.inventoryMovement.create({
          data: {
            businessId,
            productId: transfer.productId,
            fromLocation: sourceLocation,
            toLocation: destinationLocation,
            quantity: transfer.quantity,
            movementType: isExternalMovement ? 'external_transfer' : 'transfer',
            reason: transfer.reason || (isExternalMovement ? `External transfer to ${externalDestination}` : `Transfer from ${sourceLocation} to ${destinationLocation}`),
            createdBy
          }
        })

        transferResults.push({
          productId: transfer.productId,
          quantity: transfer.quantity,
          fromLocation: sourceLocation,
          toLocation: destinationLocation,
          movementId: movementRecord.id,
          isExternal: isExternalMovement,
          externalDestination: isExternalMovement ? externalDestination : null
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
