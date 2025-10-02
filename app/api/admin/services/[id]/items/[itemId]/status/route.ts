import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../../lib/auth-config'
import prisma from '../../../../../../../lib/prisma'

// PUT - Update service item status
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
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['AVAILABLE', 'RENTED', 'BOOKED', 'MAINTENANCE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify service item belongs to the service
    const serviceItem = await prisma.serviceItem.findFirst({
      where: {
        id: itemId,
        serviceId: serviceId
      }
    })

    if (!serviceItem) {
      return NextResponse.json(
        { success: false, message: 'Service item not found' },
        { status: 404 }
      )
    }

    // Update service item status
    const updatedItem = await prisma.serviceItem.update({
      where: { id: itemId },
      data: {
        status,
        // Clear rental data if marking as available
        ...(status === 'AVAILABLE' && {
          currentRentalStart: null,
          currentRentalEnd: null,
          currentCustomerId: null
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Service item status updated successfully'
    })

  } catch (error) {
    console.error('Error updating service item status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update service item status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
