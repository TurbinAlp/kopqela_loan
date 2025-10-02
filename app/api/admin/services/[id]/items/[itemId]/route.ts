import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth-config'
import prisma from '../../../../../../lib/prisma'

// PUT - Update a service item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const serviceId = parseInt(resolvedParams.id)
    const itemId = parseInt(resolvedParams.itemId)
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
      specifications 
    } = body

    if (!itemNumber || !name || !price || !durationValue || !durationUnit) {
      return NextResponse.json(
        { success: false, message: 'Item number, name, price, duration value, and duration unit are required' },
        { status: 400 }
      )
    }

    // Check if the item exists and belongs to the service
    const existingItem = await prisma.serviceItem.findFirst({
      where: {
        id: itemId,
        serviceId
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Service item not found' },
        { status: 404 }
      )
    }

    // Check if item number already exists for this service (excluding current item)
    const duplicateItem = await prisma.serviceItem.findFirst({
      where: {
        serviceId,
        itemNumber,
        id: {
          not: itemId
        }
      }
    })

    if (duplicateItem) {
      return NextResponse.json(
        { success: false, message: `Item number "${itemNumber}" already exists for this service` },
        { status: 400 }
      )
    }

    // Update service item
    const updatedItem = await prisma.serviceItem.update({
      where: {
        id: itemId
      },
      data: {
        itemNumber,
        name,
        nameSwahili: nameSwahili || null,
        description: description || null,
        price: parseFloat(price),
        durationValue: parseInt(durationValue),
        durationUnit,
        status: status || 'AVAILABLE',
        specifications: specifications || null
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
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const serviceId = parseInt(resolvedParams.id)
    const itemId = parseInt(resolvedParams.itemId)

    // Check if the item exists and belongs to the service
    const existingItem = await prisma.serviceItem.findFirst({
      where: {
        id: itemId,
        serviceId
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: 'Service item not found' },
        { status: 404 }
      )
    }

    // Check if item is currently rented
    if (existingItem.status === 'RENTED') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete a rented item' },
        { status: 400 }
      )
    }

    // Delete service item
    await prisma.serviceItem.delete({
      where: {
        id: itemId
      }
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
