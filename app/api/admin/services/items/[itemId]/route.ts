import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth-config'
import prisma from '../../../../../lib/prisma'

// PUT - Update a service item
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const itemId = parseInt(params.itemId)
    const body = await request.json()
    const { 
      itemNumber, 
      name, 
      nameSwahili, 
      description, 
      price, 
      durationValue,
      durationUnit,
      status,
      currentRentalStart,
      currentRentalEnd,
      currentCustomerId,
      specifications 
    } = body

    // If updating item number, check it doesn't conflict
    if (itemNumber) {
      const item = await prisma.serviceItem.findUnique({
        where: { id: itemId }
      })

      if (!item) {
        return NextResponse.json(
          { success: false, message: 'Service item not found' },
          { status: 404 }
        )
      }

      const existingItem = await prisma.serviceItem.findFirst({
        where: {
          serviceId: item.serviceId,
          itemNumber,
          NOT: { id: itemId }
        }
      })

      if (existingItem) {
        return NextResponse.json(
          { success: false, message: `Item number "${itemNumber}" already exists for this service` },
          { status: 400 }
        )
      }
    }

    // Update service item
    const updatedItem = await prisma.serviceItem.update({
      where: { id: itemId },
      data: {
        ...(itemNumber && { itemNumber }),
        ...(name && { name }),
        ...(nameSwahili !== undefined && { nameSwahili }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(durationValue && { durationValue: parseInt(durationValue) }),
        ...(durationUnit && { durationUnit }),
        ...(status && { status }),
        ...(currentRentalStart !== undefined && { 
          currentRentalStart: currentRentalStart ? new Date(currentRentalStart) : null 
        }),
        ...(currentRentalEnd !== undefined && { 
          currentRentalEnd: currentRentalEnd ? new Date(currentRentalEnd) : null 
        }),
        ...(currentCustomerId !== undefined && { currentCustomerId }),
        ...(specifications !== undefined && { specifications })
      },
      include: {
        currentCustomer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Service item updated successfully'
    })

  } catch (error) {
    console.error('Error updating service item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update service item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a service item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const itemId = parseInt(params.itemId)

    // Check if item is currently rented
    const item = await prisma.serviceItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Service item not found' },
        { status: 404 }
      )
    }

    if (item.status === 'RENTED') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete an item that is currently rented' },
        { status: 400 }
      )
    }

    // Delete service item
    await prisma.serviceItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: 'Service item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting service item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete service item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
