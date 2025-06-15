import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '../../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware'
import { Resource, Action } from '../../../../lib/rbac/permissions'

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessId = formData.get('businessId') as string

    if (!file || !businessId) {
      return NextResponse.json({
        success: false,
        message: 'File and business ID are required'
      }, { status: 400 })
    }

    const businessIdNum = parseInt(businessId)

    // Check permission to update business data
    const hasAccess = await hasPermission(authContext, Resource.BUSINESS, Action.UPDATE, businessIdNum)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update business logo'
      }, { status: 403 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        message: 'Only image files are allowed'
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: 'File size must be less than 5MB'
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'logos')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `business-${businessIdNum}-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const logoUrl = `/uploads/logos/${fileName}`

    // Update business settings with new logo URL
    await prisma.businessSetting.upsert({
      where: { businessId: businessIdNum },
      update: { logoUrl },
      create: {
        businessId: businessIdNum,
        logoUrl
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl
    })

  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload logo'
    }, { status: 500 })
  }
} 