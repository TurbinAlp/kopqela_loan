import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // Update Google ID if not set
            if (!existingUser.googleId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  googleId: account.providerAccountId,
                  picture: user.image,
                  provider: 'google',
                  isVerified: true,
                }
              })
            }
            return true
          }

          // Create new user with Google account
          const [firstName, ...lastNameParts] = (user.name || '').split(' ')
          const lastName = lastNameParts.join(' ') || 'User'

          await prisma.user.create({
            data: {
              firstName,
              lastName,
              email: user.email!,
              googleId: account.providerAccountId,
              picture: user.image,
              provider: 'google',
              isVerified: true,
              role: 'ADMIN'
            }
          })

          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      // Add user role to JWT token
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true, firstName: true, lastName: true }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.userId = dbUser.id
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.userId = token.userId as number
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 