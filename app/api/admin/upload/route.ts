import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '../../../lib/prisma'
import { getAuthContext, hasPermission } from '../../../lib/rbac/middleware'
import { Resource, Action } from '../../../lib/rbac/permissions'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * POST /api/admin/upload
 * Upload product images for authenticated business owners
 */
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
    const businessIdStr = formData.get('businessId') as string
    
    if (!businessIdStr) {
      return NextResponse.json({
        success: false,
        message: 'Business ID is required'
      }, { status: 400 })
    }

    const businessId = parseInt(businessIdStr)
    if (isNaN(businessId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid business ID'
      }, { status: 400 })
    }

    // Verify business ownership - check if user is owner or has permissions
    const isOwner = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: authContext.userId,
        isActive: true
      }
    });
    
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: authContext.userId,
        businessId: businessId,
        isActive: true
      }
    });
    
    if (!isOwner && !userPermission) {
      return NextResponse.json({
        success: false,
        message: 'Access denied'
      }, { status: 403 })
    }

    // Check permission to create products (needed for uploading product images)
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.CREATE, businessId)
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to upload product images'
      }, { status: 403 })
    }

    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No files provided'
      }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({
        success: false,
        message: 'Maximum 5 images allowed'
      }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      if (!file.size) continue

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          message: `File ${file.name} is too large. Maximum size is 5MB`
        }, { status: 400 })
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          success: false,
          message: `File ${file.name} has invalid type. Only JPEG, PNG, and WebP are allowed`
        }, { status: 400 })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = path.extname(file.name)
      const filename = `product_${businessId}_${timestamp}_${randomString}${extension}`
      
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Save file
      const filePath = path.join(uploadDir, filename)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      await writeFile(filePath, buffer)

      // Generate public URL
      const publicUrl = `/uploads/products/${filename}`
      
      uploadedFiles.push({
        originalName: file.name,
        filename,
        url: publicUrl,
        size: file.size,
        type: file.type
      })
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload files'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/upload
 * Get information about upload limits and allowed types
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: 5,
      allowedTypes: ALLOWED_TYPES,
      uploadPath: '/uploads/products/'
    }
  })
} 