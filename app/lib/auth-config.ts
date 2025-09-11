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
            where: { email: credentials.email.toLowerCase() }
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
            // Return null but we'll handle this in signIn callback
            console.log('User not verified:', user.email)
            return null
          }

          // Business-specific active status handled at application level
          // User account level only checks verification status

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
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
            where: { email: user.email!.toLowerCase() }
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
                email: user.email!.toLowerCase(),
                googleId: profile?.sub,
                picture: user.image,
                provider: 'google',
                isVerified: true,
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
            where: { email: user.email!.toLowerCase() }
          })

          if (dbUser) {
            token.userId = dbUser.id
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
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.picture = user.image
        }

        // Get user role and permissions based on default business
        if (token.userId) {
          try {
            let userRole: string = 'customer'
            let userPermissions: string[] = []

            // Check if user has a default business preference
            const defaultBusinessPref = await prisma.userPreference.findFirst({
              where: {
                userId: token.userId as number,
                key: 'default_business'
              }
            })

            if (defaultBusinessPref) {
              const defaultBusinessId = parseInt(JSON.parse(defaultBusinessPref.value))

              // Check if user owns this business
              const ownedBusiness = await prisma.business.findFirst({
                where: {
                  id: defaultBusinessId,
                  ownerId: token.userId as number
                }
              })

              if (ownedBusiness) {
                userRole = 'admin'
              } else {
                // Check user's role in this business
                const businessUser = await prisma.businessUser.findFirst({
                  where: {
                    userId: token.userId as number,
                    businessId: defaultBusinessId,
                    isActive: true,
                    isDeleted: false
                  },
                  select: { role: true }
                })

                if (businessUser) {
                  userRole = businessUser.role.toLowerCase()
                }
              }

              console.log('Login - Default business found:', defaultBusinessId, 'Role:', userRole)
            } else {
              console.log('Login - No default business, using customer role')
            }

            // Store role in token
            token.role = userRole

            // Get permissions using the determined role
            userPermissions = await getUserPermissions(
              token.userId as number,
              undefined, // no businessId filter
              userRole // use determined role
            )
            token.permissions = userPermissions

            console.log('Login - Final role:', userRole, 'Permissions count:', userPermissions.length)
          } catch (error) {
            console.error('Error getting role/permissions for token:', error)
            token.permissions = []
            token.role = 'customer'
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as number
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.permissions = token.permissions as string[]
        session.user.role = token.role as string

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