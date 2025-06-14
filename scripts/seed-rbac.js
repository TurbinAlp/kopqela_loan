const { PrismaClient } = require('../app/generated/prisma')

const prisma = new PrismaClient()

// Permission definitions
const PERMISSION_DEFINITIONS = [
  // User Management
  {
    name: 'users.create',
    resource: 'users',
    action: 'create',
    description: 'Create new users in the system'
  },
  {
    name: 'users.read',
    resource: 'users',
    action: 'read',
    description: 'View user information'
  },
  {
    name: 'users.update',
    resource: 'users',
    action: 'update',
    description: 'Update user information'
  },
  {
    name: 'users.delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete users from the system'
  },
  {
    name: 'employees.manage',
    resource: 'employees',
    action: 'manage',
    description: 'Manage employee accounts and roles'
  },
  {
    name: 'customers.read',
    resource: 'customers',
    action: 'read',
    description: 'View customer information'
  },
  {
    name: 'customers.update',
    resource: 'customers',
    action: 'update',
    description: 'Update customer information'
  },

  // Business Management
  {
    name: 'business.read',
    resource: 'business',
    action: 'read',
    description: 'View business information'
  },
  {
    name: 'business.update',
    resource: 'business',
    action: 'update',
    description: 'Update business information'
  },
  {
    name: 'business_settings.manage',
    resource: 'business_settings',
    action: 'manage',
    description: 'Manage business settings and configuration'
  },

  // Product Management
  {
    name: 'products.create',
    resource: 'products',
    action: 'create',
    description: 'Add new products to inventory'
  },
  {
    name: 'products.read',
    resource: 'products',
    action: 'read',
    description: 'View product information'
  },
  {
    name: 'products.update',
    resource: 'products',
    action: 'update',
    description: 'Update product information and pricing'
  },
  {
    name: 'products.delete',
    resource: 'products',
    action: 'delete',
    description: 'Remove products from inventory'
  },
  {
    name: 'categories.manage',
    resource: 'categories',
    action: 'manage',
    description: 'Manage product categories'
  },
  {
    name: 'inventory.read',
    resource: 'inventory',
    action: 'read',
    description: 'View inventory levels and status'
  },
  {
    name: 'inventory.update',
    resource: 'inventory',
    action: 'update',
    description: 'Update inventory levels and stock'
  },

  // Order Management
  {
    name: 'orders.create',
    resource: 'orders',
    action: 'create',
    description: 'Create new orders'
  },
  {
    name: 'orders.read',
    resource: 'orders',
    action: 'read',
    description: 'View order information'
  },
  {
    name: 'orders.update',
    resource: 'orders',
    action: 'update',
    description: 'Update order status and information'
  },
  {
    name: 'orders.delete',
    resource: 'orders',
    action: 'delete',
    description: 'Cancel or delete orders'
  },

  // Sales & POS
  {
    name: 'sales.read',
    resource: 'sales',
    action: 'read',
    description: 'View sales data and transactions'
  },
  {
    name: 'sales.export',
    resource: 'sales',
    action: 'export',
    description: 'Export sales reports'
  },
  {
    name: 'pos.create',
    resource: 'pos',
    action: 'create',
    description: 'Process POS transactions'
  },
  {
    name: 'pos.read',
    resource: 'pos',
    action: 'read',
    description: 'View POS transaction history'
  },

  // Payment Management
  {
    name: 'payments.create',
    resource: 'payments',
    action: 'create',
    description: 'Process payments'
  },
  {
    name: 'payments.read',
    resource: 'payments',
    action: 'read',
    description: 'View payment information'
  },
  {
    name: 'payments.process_payment',
    resource: 'payments',
    action: 'process_payment',
    description: 'Process and authorize payments'
  },
  {
    name: 'payments.refund',
    resource: 'payments',
    action: 'refund',
    description: 'Process payment refunds'
  },

  // Credit Management
  {
    name: 'credit_applications.read',
    resource: 'credit_applications',
    action: 'read',
    description: 'View credit applications'
  },
  {
    name: 'credit_applications.create',
    resource: 'credit_applications',
    action: 'create',
    description: 'Submit credit applications'
  },
  {
    name: 'credit_applications.approve',
    resource: 'credit_applications',
    action: 'approve',
    description: 'Approve credit applications'
  },
  {
    name: 'credit_applications.reject',
    resource: 'credit_applications',
    action: 'reject',
    description: 'Reject credit applications'
  },
  {
    name: 'credit_assessment.assess_credit',
    resource: 'credit_assessment',
    action: 'assess_credit',
    description: 'Perform credit risk assessment'
  },

  // Reports & Analytics
  {
    name: 'reports.read',
    resource: 'reports',
    action: 'read',
    description: 'View business reports'
  },
  {
    name: 'reports.export',
    resource: 'reports',
    action: 'export',
    description: 'Export reports and data'
  },
  {
    name: 'analytics.read',
    resource: 'analytics',
    action: 'read',
    description: 'View analytics and insights'
  },
  {
    name: 'dashboard.read',
    resource: 'dashboard',
    action: 'read',
    description: 'Access dashboard and metrics'
  },

  // System Administration
  {
    name: 'system.manage',
    resource: 'system',
    action: 'manage',
    description: 'System administration privileges'
  },
  {
    name: 'audit_logs.read',
    resource: 'audit_logs',
    action: 'read',
    description: 'View system audit logs'
  },
  {
    name: 'settings.manage',
    resource: 'settings',
    action: 'manage',
    description: 'Manage system settings'
  }
]

// Role-based permission assignments
const ROLE_PERMISSIONS = {
  ADMIN: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'employees.manage',
    'customers.read', 'customers.update',
    'business.read', 'business.update',
    'business_settings.manage',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'categories.manage',
    'inventory.read', 'inventory.update',
    'orders.create', 'orders.read', 'orders.update', 'orders.delete',
    'sales.read', 'sales.export',
    'pos.create', 'pos.read',
    'payments.create', 'payments.read', 'payments.process_payment', 'payments.refund',
    'credit_applications.read', 'credit_applications.create', 'credit_applications.approve', 'credit_applications.reject',
    'credit_assessment.assess_credit',
    'reports.read', 'reports.export',
    'analytics.read',
    'dashboard.read',
    'audit_logs.read',
    'settings.manage'
  ],
  
  MANAGER: [
    'users.read',
    'employees.manage',
    'customers.read', 'customers.update',
    'business.read',
    'products.create', 'products.read', 'products.update',
    'categories.manage',
    'inventory.read', 'inventory.update',
    'orders.create', 'orders.read', 'orders.update',
    'sales.read', 'sales.export',
    'pos.create', 'pos.read',
    'payments.create', 'payments.read', 'payments.process_payment',
    'credit_applications.read', 'credit_applications.approve', 'credit_applications.reject',
    'credit_assessment.assess_credit',
    'reports.read', 'reports.export',
    'analytics.read',
    'dashboard.read'
  ],
  
  CASHIER: [
    'customers.read',
    'products.read',
    'inventory.read',
    'orders.create', 'orders.read', 'orders.update',
    'sales.read',
    'pos.create', 'pos.read',
    'payments.create', 'payments.read', 'payments.process_payment',
    'credit_applications.create', 'credit_applications.read',
    'dashboard.read'
  ],
  
  CUSTOMER: [
    'orders.read',
    'payments.read',
    'credit_applications.create', 'credit_applications.read'
  ]
}

async function seedPermissions() {
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
      for (const permissionName of permissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        })

        if (permission) {
          // Check if role permission already exists
          const existingRolePermission = await prisma.rolePermission.findFirst({
            where: {
              role: roleName,
              permissionId: permission.id,
              businessId: null
            }
          })

          if (!existingRolePermission) {
            await prisma.rolePermission.create({
              data: {
                role: roleName,
                permissionId: permission.id,
                businessId: null,
                isActive: true
              }
            })
            rolePermCount++
          } else {
            // Update existing to ensure it's active
            await prisma.rolePermission.update({
              where: { id: existingRolePermission.id },
              data: { isActive: true }
            })
          }
        }
      }
    }

    console.log(`✅ Created/Updated ${rolePermCount} role-permission assignments`)
    console.log('🎉 Permission seeding completed successfully!')

    return {
      permissions: PERMISSION_DEFINITIONS.length,
      rolePermissions: rolePermCount
    }
  } catch (error) {
    console.error('❌ Error seeding permissions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedPermissions()
  .then(() => {
    console.log('✅ Seeding completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }) 