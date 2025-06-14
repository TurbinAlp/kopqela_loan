import { NextAuthOptions, User } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { getUserPermissions } from './rbac/middleware'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          if (!user.isVerified) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.picture || undefined
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // Update Google ID if not set
            if (!existingUser.googleId && profile?.sub) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  googleId: profile.sub,
                  picture: user.image,
                  provider: 'google', 
                  isVerified: true,
                  lastLoginAt: new Date()
                }
              })
            } else {
              // Update last login
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: new Date() }
              })
            }
            return true
          }

          // For new Google users, redirect to complete registration
          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }

      // For credentials provider, update last login
      if (account?.provider === 'credentials' && user.id) {
        try {
          await prisma.user.update({
            where: { id: parseInt(user.id) },
            data: { lastLoginAt: new Date() }
          })
        } catch (error) {
          console.error('Error updating last login:', error)
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        if (account?.provider === 'google') {
          // Handle Google OAuth
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            token.firstName = dbUser.firstName
            token.lastName = dbUser.lastName
            token.picture = dbUser.picture || user.image
          }
        } else {
          // Handle credentials login
          token.userId = parseInt(user.id)
          token.role = user.role
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.picture = user.image
        }

        // Get user permissions and add to token
        if (token.userId) {
          try {
            const permissions = await getUserPermissions(
              token.userId as number
            )
            token.permissions = permissions
          } catch (error) {
            console.error('Error getting permissions for token:', error)
            token.permissions = []
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as number
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.permissions = token.permissions as string[]
        
        if (token.picture) {
          session.user.image = token.picture as string
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions 