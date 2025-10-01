import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth-config'
import prisma from '../../../lib/prisma'

// GET - Fetch all services for a business
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Check if we need full items (for POS) or just counts
    const includeItems = searchParams.get('includeItems') === 'true'

    // Fetch services with item counts and optionally items
    const services = await prisma.service.findMany({
      where: {
        businessId: parseInt(businessId)
      },
      include: {
        _count: {
          select: { serviceItems: true }
        },
        ...(includeItems && {
          serviceItems: {
            where: {
              status: 'AVAILABLE' // Only fetch available items for POS
            },
            select: {
              id: true,
              serviceId: true,
              itemNumber: true,
              name: true,
              nameSwahili: true,
              description: true,
              price: true,
              durationValue: true,
              durationUnit: true,
              status: true
            }
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: includeItems ? services : {
        services,
        totalCount: services.length
      }
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch services',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { businessId, serviceType, name, nameSwahili, description } = body

    if (!businessId || !serviceType || !name) {
      return NextResponse.json(
        { success: false, message: 'Business ID, service type, and name are required' },
        { status: 400 }
      )
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        businessId: parseInt(businessId),
        serviceType,
        name,
        nameSwahili: nameSwahili || null,
        description: description || null,
        isActive: true
      },
      include: {
        _count: {
          select: { serviceItems: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service created successfully'
    })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create service',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
