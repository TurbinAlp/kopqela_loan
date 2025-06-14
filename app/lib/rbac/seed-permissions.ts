import { prisma } from '../prisma'
import { PERMISSION_DEFINITIONS, ROLE_PERMISSIONS } from './permissions'

// Import UserRole type from the actual values
type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'CUSTOMER'

/**
 * Seed database with default permissions
 */
export async function seedPermissions() {
  console.log('🌱 Seeding permissions...')

  try {
    // Create all permission definitions
    for (const permDef of PERMISSION_DEFINITIONS) {
      await prisma.permission.upsert({
        where: { name: permDef.name },
        update: {
          resource: permDef.resource,
          action: permDef.action,
          description: permDef.description,
          isActive: true
        },
        create: {
          name: permDef.name,
          resource: permDef.resource,
          action: permDef.action,
          description: permDef.description,
          isActive: true
        }
      })
    }

    console.log(`✅ Created ${PERMISSION_DEFINITIONS.length} permissions`)

    // Create role-permission assignments
    let rolePermCount = 0

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = roleName as UserRole

      for (const permissionName of permissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        })

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              role_permissionId_businessId: {
                role,
                permissionId: permission.id,
                businessId: null // Global role permissions
              }
            },
            update: {
              isActive: true
            },
            create: {
              role,
              permissionId: permission.id,
              businessId: null,
              isActive: true
            }
          })
          rolePermCount++
        }
      }
    }

    console.log(`✅ Created ${rolePermCount} role-permission assignments`)
    console.log('🎉 Permission seeding completed successfully!')

    return {
      permissions: PERMISSION_DEFINITIONS.length,
      rolePermissions: rolePermCount
    }
  } catch (error) {
    console.error('❌ Error seeding permissions:', error)
    throw error
  }
}

/**
 * Grant permission to a specific user
 */
export async function grantUserPermission(
  userId: number,
  permissionName: string,
  businessId?: number,
  grantedBy?: number,
  expiresAt?: Date
) {
  const permission = await prisma.permission.findUnique({
    where: { name: permissionName }
  })

  if (!permission) {
    throw new Error(`Permission '${permissionName}' not found`)
  }

  return await prisma.userPermission.upsert({
    where: {
      userId_permissionId_businessId: {
        userId,
        permissionId: permission.id,
        businessId: businessId || null
      }
    },
    update: {
      granted: true,
      grantedBy,
      expiresAt,
      isActive: true
    },
    create: {
      userId,
      permissionId: permission.id,
      businessId: businessId || null,
      granted: true,
      grantedBy,
      expiresAt,
      isActive: true
    }
  })
}

/**
 * Revoke permission from a user
 */
export async function revokeUserPermission(
  userId: number,
  permissionName: string,
  businessId?: number
) {
  const permission = await prisma.permission.findUnique({
    where: { name: permissionName }
  })

  if (!permission) {
    throw new Error(`Permission '${permissionName}' not found`)
  }

  return await prisma.userPermission.updateMany({
    where: {
      userId,
      permissionId: permission.id,
      businessId: businessId || null
    },
    data: {
      granted: false,
      isActive: false
    }
  })
}

/**
 * Get all permissions for a role
 */
export async function getRolePermissions(role: UserRole, businessId?: number) {
  return await prisma.rolePermission.findMany({
    where: {
      role,
      businessId: businessId || null,
      isActive: true
    },
    include: {
      permission: true
    }
  })
}

/**
 * Get all permissions for a user (including role-based and explicit)
 */
export async function getUserAllPermissions(userId: number, businessId?: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get role-based permissions
  const rolePermissions = await getRolePermissions(user.role as UserRole, businessId)

  // Get explicit user permissions
  const userPermissions = await prisma.userPermission.findMany({
    where: {
      userId,
      businessId: businessId || null,
      isActive: true,
      granted: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    include: {
      permission: true
    }
  })

  return {
    rolePermissions: rolePermissions.map(rp => rp.permission),
    userPermissions: userPermissions.map(up => up.permission),
    allPermissions: [
      ...rolePermissions.map(rp => rp.permission),
      ...userPermissions.map(up => up.permission)
    ]
  }
}

/**
 * Check if user has permission
 */
export async function checkUserPermission(
  userId: number,
  permissionName: string,
  businessId?: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (!user) return false

  const permission = await prisma.permission.findUnique({
    where: { name: permissionName }
  })

  if (!permission) return false

  // Check role-based permission
  const rolePermission = await prisma.rolePermission.findUnique({
    where: {
      role_permissionId_businessId: {
        role: user.role as UserRole,
        permissionId: permission.id,
        businessId: businessId || null
      }
    }
  })

  if (rolePermission?.isActive) return true

  // Check explicit user permission
  const userPermission = await prisma.userPermission.findFirst({
    where: {
      userId,
      permissionId: permission.id,
      businessId: businessId || null,
      granted: true,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  })

  return !!userPermission
}

/**
 * Set up default admin permissions for a business owner
 */
export async function setupBusinessOwnerPermissions(userId: number, businessId: number) {
  // Business owners get all admin permissions for their business
  const adminPermissions = ROLE_PERMISSIONS.ADMIN

  const results = []
  for (const permissionName of adminPermissions) {
    try {
      const result = await grantUserPermission(userId, permissionName, businessId)
      results.push(result)
    } catch (error) {
      console.error(`Error granting permission ${permissionName}:`, error)
    }
  }

  return results
}

/**
 * Clean up expired permissions
 */
export async function cleanupExpiredPermissions() {
  const result = await prisma.userPermission.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      isActive: true
    },
    data: {
      isActive: false
    }
  })

  console.log(`🧹 Cleaned up ${result.count} expired permissions`)
  return result
}

/**
 * Run the seeding process
 */
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('✅ Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
} 