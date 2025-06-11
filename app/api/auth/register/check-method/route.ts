import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // For now, we only support business registration
    // This endpoint is for future expansion if we add different registration types
    
    // Validate request
    if (!body.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required',
          code: 'EMAIL_REQUIRED'
        },
        { status: 400 }
      )
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      )
    }

    // For business registration, we support both Google OAuth and Email registration
    const availableMethods = [
      {
        method: 'google',
        label: 'Continue with Google',
        description: 'Quick setup with your Google account',
        recommended: true
      },
      {
        method: 'email',
        label: 'Register with Email',
        description: 'Create account with email and password',
        recommended: false
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        email: body.email,
        registrationType: 'business',
        availableMethods,
        message: 'Business registration methods available'
      }
    })

  } catch (error) {
    console.error('Registration method check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to check registration methods.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
} 