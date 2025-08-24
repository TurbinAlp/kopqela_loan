import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface VerificationEmailData {
  name: string
  email: string
  code: string
  businessName?: string
}

interface WelcomeEmailData {
  name: string
  email: string
  businessName: string
  businessSlug: string
  loginUrl: string
}

interface PasswordResetEmailData {
  name: string
  email: string
  code: string
  businessName?: string
}

// Email configuration with better defaults
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use STARTTLS instead of SSL
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}

// Create transporter with additional options
const transporter = nodemailer.createTransport({
  ...emailConfig,
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates in development
  },
  // Add Gmail specific options
  service: process.env.SMTP_HOST?.includes('gmail') ? 'gmail' : undefined
})

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('Email service connected successfully')
    return true
  } catch (error) {
    console.error('Email connection failed:', error)
    return false
  }
}

// Send verification email
export async function sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
  try {
    // Check if email is properly configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Logging verification code instead:', data.code)
      console.log(`Verification code for ${data.email}: ${data.code}`)
      return true // Return true for development
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email - Koppela</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #14b8a6; }
          .verification-code { 
            background: #f0fdfa; 
            border: 2px solid #14b8a6; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0; 
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #14b8a6; 
            letter-spacing: 5px; 
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">KOPPELA</div>
            <h1>Verify Your Email Address</h1>
          </div>
          
          <p>Hi ${data.name},</p>
          
          <p>Thank you for registering ${data.businessName ? `your business "${data.businessName}"` : ''} with Koppela! To complete your registration, please verify your email address using the code below:</p>
          
          <div class="verification-code">
            <p><strong>Your Verification Code:</strong></p>
            <div class="code">${data.code}</div>
          </div>
          
          <p>This code will expire in 15 minutes for security reasons.</p>
          
          <p>If you didn't create an account with Koppela, please ignore this email.</p>
          
          <div class="footer">
            <p>© 2025 Koppela. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Hi ${data.name},
      
      Thank you for registering ${data.businessName ? `your business "${data.businessName}"` : ''} with Koppela!
      
      Your verification code is: ${data.code}
      
      This code will expire in 15 minutes.
      
      If you didn't create an account with Koppela, please ignore this email.
      
      © 2025 Koppela. All rights reserved.
    `

    const mailOptions = {
      from: `"Koppela" <${emailConfig.auth.user}>`,
      to: data.email,
      subject: 'Verify Your Email - Koppela',
      text: textContent,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    // For development, log the code even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`Verification code for ${data.email}: ${data.code}`)
      return true
    }
    return false
  }
}

// Send welcome email
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to Koppela!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #14b8a6; }
          .button { 
            display: inline-block; 
            background: #14b8a6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">KOPPELA</div>
            <h1>Welcome to Koppela!</h1>
          </div>
          
          <p>Hi ${data.name},</p>
          
          <p>Congratulations! Your business "<strong>${data.businessName}</strong>" has been successfully registered with Koppela.</p>
          
          <p>You can now access your business dashboard and start managing your sales and credit operations:</p>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" class="button">Access Your Dashboard</a>
          </div>
          
          <p><strong>Your business URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/store/${data.businessSlug}</p>
          
          <p>What you can do now:</p>
          <ul>
            <li>Set up your product catalog</li>
            <li>Configure payment methods</li>
            <li>Invite employees to join your team</li>
            <li>Start accepting orders and credit applications</li>
          </ul>
          
          <p>If you need any help getting started, feel free to contact our support team.</p>
          
          <p>Welcome aboard!</p>
          
          <div class="footer">
            <p>© 2025 Koppela. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `"Koppela" <${emailConfig.auth.user}>`,
      to: data.email,
      subject: `Welcome to Koppela - ${data.businessName}`,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}

// Send password reset email
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
  try {
    // Check if email is properly configured
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Logging password reset code instead:', data.code)
      console.log(`Password reset code for ${data.email}: ${data.code}`)
      return true // Return true for development
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your Password - Koppela</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #14b8a6; }
          .reset-code { 
            background: #fef2f2; 
            border: 2px solid #dc2626; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 20px 0; 
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #dc2626; 
            letter-spacing: 5px; 
          }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">KOPPELA</div>
            <h1>Reset Your Password</h1>
          </div>
          
          <p>Hi ${data.name},</p>
          
          <p>We received a request to reset your password ${data.businessName ? `for your business "${data.businessName}"` : ''}. Use the code below to reset your password:</p>
          
          <div class="reset-code">
            <p><strong>Your Password Reset Code:</strong></p>
            <div class="code">${data.code}</div>
          </div>
          
          <p>This code will expire in 30 minutes for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <div class="footer">
            <p>© 2025 Koppela. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Hi ${data.name},
      
      We received a request to reset your password ${data.businessName ? `for your business "${data.businessName}"` : ''}.
      
      Your password reset code is: ${data.code}
      
      This code will expire in 30 minutes.
      
      If you didn't request a password reset, please ignore this email.
      
      © 2025 Koppela. All rights reserved.
    `

    const mailOptions = {
      from: `"Koppela" <${emailConfig.auth.user}>`,
      to: data.email,
      subject: 'Reset Your Password - Koppela',
      text: textContent,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    // For development, log the code even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset code for ${data.email}: ${data.code}`)
      return true
    }
    return false
  }
} 