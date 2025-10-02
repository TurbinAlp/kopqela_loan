import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth-config'
import prisma from '../../../../lib/prisma'

// PUT - Update a service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const body = await request.json()
    const { serviceType, name, nameSwahili, description } = body

    if (!name || !serviceType) {
      return NextResponse.json(
        { success: false, message: 'Service name and type are required' },
        { status: 400 }
      )
    }

    // Update service
    const service = await prisma.service.update({
      where: {
        id: serviceId
      },
      data: {
        serviceType,
        name,
        nameSwahili: nameSwahili || null,
        description: description || null,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            serviceItems: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    })

  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update service',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if the service exists
    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId
      },
      include: {
        _count: {
          select: {
            serviceItems: true
          }
        }
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      )
    }

    // Delete all service items first, then the service
    await prisma.$transaction([
      prisma.serviceItem.deleteMany({
        where: {
          serviceId: serviceId
        }
      }),
      prisma.service.delete({
        where: {
          id: serviceId
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Service and all associated items deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete service',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
