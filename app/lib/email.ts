import nodemailer from 'nodemailer'

// Global variable for current year
const currentYear = new Date().getFullYear()

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
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

interface EmployeeInvitationEmailData {
  name: string
  email: string
  code: string
  businessName: string
  role: string
  invitedBy: string
}

interface BusinessInvitationEmailData {
  name: string
  email: string
  businessName: string
  role: string
  invitedBy: string
}


// Email configuration with better defaults
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  from: process.env.SMTP_FROM || 'noreply@koppela.com'
}

// Create transporter with additional options
const transporter = nodemailer.createTransport({
  ...emailConfig,
  tls: {
    rejectUnauthorized: false 
  },
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
    
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Logging verification code instead:', data.code)
      console.log(`Verification code for ${data.email}: ${data.code}`)
      return true 
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
            <p>© ${currentYear} Koppela. All rights reserved.</p>
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
      
      © ${currentYear} Koppela. All rights reserved.
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
          
          <p><strong>Your business URL:</strong> ${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://koppela.com'}/store/${data.businessSlug}</p>
          
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
            <p>© ${currentYear} Koppela. All rights reserved.</p>
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
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Logging password reset code instead:', data.code)
      console.log(`Password reset code for ${data.email}: ${data.code}`)
      return true 
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
            <p>© ${currentYear} Koppela. All rights reserved.</p>
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
      
      © ${currentYear} Koppela. All rights reserved.
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset code for ${data.email}: ${data.code}`)
      return true
    }
    return false
  }
}

// Send employee invitation email
export async function sendEmployeeInvitationEmail(data: EmployeeInvitationEmailData): Promise<boolean> {
  try {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Logging verification code instead:', data.code)
      console.log(`Employee invitation code for ${data.email}: ${data.code}`)
      return true 
    }

    const roleNames = {
      'ADMIN': 'Administrator',
      'MANAGER': 'Manager', 
      'CASHIER': 'Cashier'
    }
    
    const roleName = roleNames[data.role as keyof typeof roleNames] || data.role

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to ${data.businessName} - Koppela</title>
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
          .credentials-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
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
            <h1>Welcome to ${data.businessName}!</h1>
          </div>
          
          <p>Hi ${data.name},</p>
          
          <p>You have been invited by <strong>${data.invitedBy}</strong> to join <strong>${data.businessName}</strong> as a <strong>${roleName}</strong> on the Koppela platform.</p>
          
          <p>To complete your account setup and verify your email address, please use the verification code below:</p>
          
          <div class="verification-code">
            <p><strong>Your Verification Code:</strong></p>
            <div class="code">${data.code}</div>
          </div>
          
          <div class="credentials-box">
            <h3>Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Password:</strong> Set by administrator</p>
            <p><em>You will be required to change this password after your first login.</em></p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://koppela.com'}/register?email=${encodeURIComponent(data.email)}" class="button">Verify Your Account</a>
          </div>
          
          <p>This verification code will expire in 24 hours for security reasons.</p>
          
          <p>As a <strong>${roleName}</strong>, you will have access to:</p>
          <ul>
            ${data.role === 'ADMIN' ? `
            <li>Full system administration</li>
            <li>User management and permissions</li>
            <li>Business settings and configuration</li>
            <li>Reports and analytics</li>
            ` : data.role === 'MANAGER' ? `
            <li>Sales and inventory management</li>
            <li>Customer management</li>
            <li>Reports and analytics</li>
            <li>Employee oversight</li>
            ` : `
            <li>Point of sale operations</li>
            <li>Customer service</li>
            <li>Order processing</li>
            <li>Payment collection</li>
            `}
          </ul>
          
          <p>If you have any questions or need assistance, please contact your administrator.</p>
          
          <p>Welcome to the team!</p>
          
          <div class="footer">
            <p>© ${currentYear} Koppela. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Hi ${data.name},
      
      You have been invited by ${data.invitedBy} to join ${data.businessName} as a ${roleName} on the Koppela platform.
      
      Your verification code is: ${data.code}
      
      Your login credentials:
      Email: ${data.email}
      Password: Set by administrator (change after first login)
      
      Verify your account at: ${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://koppela.com'}/register?email=${encodeURIComponent(data.email)}
      
      This code will expire in 24 hours.
      
      Welcome to the team!
      
      © ${currentYear} Koppela. All rights reserved.
    `

    const mailOptions = {
      from: `"Koppela" <${emailConfig.auth.user}>`,
      to: data.email,
      subject: `Welcome to ${data.businessName} - Verify Your Account`,
      text: textContent,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('Employee invitation email sent successfully to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending employee invitation email:', error)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Employee invitation code for ${data.email}: ${data.code}`)
      return true
    }
    return false
  }
}

// Send business invitation email to existing user
export async function sendBusinessInvitationEmail(data: BusinessInvitationEmailData): Promise<boolean> {
  try {
    
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email credentials not configured. Logging business invitation instead')
      console.log(`Business invitation for ${data.email} to join ${data.businessName} as ${data.role}`)
      return true 
    }

    const roleNames = {
      'ADMIN': 'Administrator',
      'MANAGER': 'Manager', 
      'CASHIER': 'Cashier'
    }

    const roleName = roleNames[data.role as keyof typeof roleNames] || data.role

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Business Invitation - Koppela</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #14b8a6; }
          .invitation-box { 
            background: #f8fafc; 
            border: 2px solid #14b8a6; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center; 
          }
          .role-badge { 
            background: #14b8a6; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 4px; 
            font-weight: bold; 
            display: inline-block; 
            margin: 10px 0; 
          }
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
            <h1>Business Invitation</h1>
          </div>
          
          <p>Hi ${data.name},</p>
          
          <div class="invitation-box">
            <h2>You've been invited to join</h2>
            <h3><strong>${data.businessName}</strong></h3>
            <div class="role-badge">${roleName}</div>
            <p>by ${data.invitedBy}</p>
          </div>
          
          <p>You have been invited to join <strong>${data.businessName}</strong> as a <strong>${roleName}</strong>.</p>
          
          <p>Since you already have a Koppela account, you can immediately access the business dashboard:</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://koppela.com'}/login" class="button">
              Login to Access Business
            </a>
          </div>
          
          <p><strong>Your new role:</strong> ${roleName}</p>
          <p><strong>Business:</strong> ${data.businessName}</p>
          <p><strong>Invited by:</strong> ${data.invitedBy}</p>
          
          <div class="footer">
            <p>Welcome to the Koppela family!</p>
            <p>If you have any questions, please contact your business administrator.</p>
            <p>&copy; ${currentYear} Koppela. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Hi ${data.name},

You've been invited to join ${data.businessName} as a ${roleName} by ${data.invitedBy}.

Since you already have a Koppela account, you can immediately access the business dashboard by logging in at:
${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://koppela.com'}/login

Your new role: ${roleName}
Business: ${data.businessName}
Invited by: ${data.invitedBy}

Welcome to the Koppela family!

If you have any questions, please contact your business administrator.

© ${currentYear} Koppela. All rights reserved.
    `

    const transporter = nodemailer.createTransport(emailConfig)

    const mailOptions = {
      from: emailConfig.from,
      to: data.email,
      subject: `Invitation to join ${data.businessName} - Koppela`,
      text: textContent,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('Business invitation email sent successfully to:', data.email)
    return true
  } catch (error) {
    console.error('Error sending business invitation email:', error)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Business invitation for ${data.email} to join ${data.businessName} as ${data.role}`)
      return true
    }
    return false
  }
}
