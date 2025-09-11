import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      email: string
      name: string
      image?: string
      businessId?: number
      firstName: string
      lastName: string
      permissions: string[]
      role: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    businessId?: number
    firstName: string
    lastName: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: number
    businessId?: number
    firstName: string
    lastName: string
    permissions: string[]
    picture?: string
    role: string
  }
} 