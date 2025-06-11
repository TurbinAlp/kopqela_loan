import { PrismaClient } from '../generated/prisma'

// Declare global variable to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Create Prisma client instance
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Helper function to check database connection
export async function checkPrismaConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Prisma connected to database successfully')
    return true
  } catch (error) {
    console.error('❌ Prisma database connection failed:', error)
    return false
  }
}

// Helper function to disconnect
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Enhanced query helper with transaction support  
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback)
}

// Helper for error handling
export function handlePrismaError(error: unknown) {
  console.error('Prisma error:', error)
  
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[]; field_name?: string } }
    
    switch (prismaError.code) {
      case 'P2002':
        return {
          code: 'UNIQUE_CONSTRAINT',
          message: 'A record with this information already exists',
          field: prismaError.meta?.target?.[0] || 'unknown'
        }
      case 'P2025':
        return {
          code: 'RECORD_NOT_FOUND', 
          message: 'Record not found',
          field: 'id'
        }
      case 'P2003':
        return {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Related record not found',
          field: prismaError.meta?.field_name || 'unknown'
        }
      default:
        return {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          field: 'unknown'
        }
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    field: 'unknown'
  }
}

export default prisma 