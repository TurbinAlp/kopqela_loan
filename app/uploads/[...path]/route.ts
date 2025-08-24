import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'

/**
 * GET /uploads/[...path]
 * Serve uploaded static files (images, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath)
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return notFound()
    }
    
    // Read file
    const fileBuffer = await readFile(fullPath)
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    })
    
  } catch (error) {
    console.error('Error serving static file:', error)
    return notFound()
  }
}
