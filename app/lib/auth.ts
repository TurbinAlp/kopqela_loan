import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Types
export interface UserPayload {
  id: number
  email: string
  businessId: number | null
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'CUSTOMER'
  businessSlug?: string
}

export interface TokenPayload extends UserPayload {
  iat: number
  exp: number
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Email verification utilities
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Business slug utilities
export function generateBusinessSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

export function addRandomSuffix(slug: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${slug}-${suffix}`
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function isValidPhone(phone: string): boolean {
  // Tanzania phone number validation
  const phoneRegex = /^(\+255|0)[67]\d{8}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Rate limiting utilities
export function getRateLimitKey(identifier: string, action: string): string {
  return `rate_limit:${action}:${identifier}`
}

// Error types
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message)
    this.name = 'ValidationError'
  }
} 