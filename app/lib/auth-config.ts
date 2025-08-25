import { NextAuthOptions, User } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { getUserPermissions } from './rbac/middleware'
import { createEastAfricaTimestamp } from './timezone'

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

          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          if (!user.passwordHash) {
            console.log('User has no password hash (Google-only user):', credentials.email)
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
                  lastLoginAt: createEastAfricaTimestamp()
                }
              })
            } else {
              // Update last login
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: createEastAfricaTimestamp() }
              })
            }
            return true
          } else {
            // Create new user from Google profile
            // Handle name parsing - Google can provide various name formats
            let firstName = 'User'
            let lastName = ''
            
            if (user.name && user.name.trim()) {
              const nameParts = user.name.trim().split(' ').filter(part => part.length > 0)
              if (nameParts.length === 1) {
                // Only one name provided (e.g., "John")
                firstName = nameParts[0]
                lastName = ''
              } else if (nameParts.length >= 2) {
                // Multiple names provided (e.g., "John Doe" or "John Peter Doe")
                firstName = nameParts[0]
                lastName = nameParts.slice(1).join(' ')
              }
            }

            const newUser = await prisma.user.create({
              data: {
                firstName,
                lastName,
                email: user.email!,
                googleId: profile?.sub,
                picture: user.image,
                provider: 'google',
                isVerified: true,
                role: 'ADMIN',
                lastLoginAt: createEastAfricaTimestamp()
              }
            })

            console.log('New Google user created:', {
              id: newUser.id,
              email: newUser.email,
              originalGoogleName: user.name,
              parsedFirstName: newUser.firstName,
              parsedLastName: newUser.lastName,
              fullName: `${newUser.firstName} ${newUser.lastName}`.trim()
            })

            return true
          }
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
            data: { lastLoginAt: createEastAfricaTimestamp() }
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
          // Handle Google OAuth - fetch user from database
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            token.firstName = dbUser.firstName
            token.lastName = dbUser.lastName
            token.picture = dbUser.picture || user.image
          } else {
            // This should not happen since we create user in signIn callback
            console.error('Google user not found in database after sign in')
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
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after authentication
      // If URL contains a callback URL, use it
      if (url.includes('callbackUrl=')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl')
        if (callbackUrl && callbackUrl.startsWith('/')) {
          return `${baseUrl}${callbackUrl}`
        }
      }
      
      // If user is trying to access a protected route, redirect there
      if (url.startsWith('/') && url !== '/login') {
        return `${baseUrl}${url}`
      }
      
      // Default redirect to dashboard for authenticated users
      return `${baseUrl}/admin/dashboard`
    }
  },
  pages: {
    signIn: '/login', // Use custom login page
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