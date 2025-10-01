import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth-config'
import prisma from '../../../../../lib/prisma'

// GET - Fetch all items for a service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceId = parseInt(params.id)

    // Fetch service items
    const items = await prisma.serviceItem.findMany({
      where: {
        serviceId
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
      },
      orderBy: {
        itemNumber: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: { items }
    })

  } catch (error) {
    console.error('Error fetching service items:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch service items',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new service item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceId = parseInt(params.id)
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

    // Check if item number already exists for this service
    const existingItem = await prisma.serviceItem.findFirst({
      where: {
        serviceId,
        itemNumber
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: `Item number "${itemNumber}" already exists for this service` },
        { status: 400 }
      )
    }

    // Create service item
    const item = await prisma.serviceItem.create({
      data: {
        serviceId,
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
      data: item,
      message: 'Service item created successfully'
    })

  } catch (error) {
    console.error('Error creating service item:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create service item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
