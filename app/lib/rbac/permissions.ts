// RBAC Permission System - Role-Based Access Control
// This file defines all available permissions and their hierarchy

export enum Resource {
  // User Management
  USERS = 'users',
  EMPLOYEES = 'employees',
  CUSTOMERS = 'customers',
  PROFILES = 'profiles',
  
  // Business Management
  BUSINESS = 'business',
  BUSINESS_SETTINGS = 'business_settings',
  
  // Product Management
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  INVENTORY = 'inventory',
  
  // Service Management
  SERVICES = 'services',
  
  // Order Management
  ORDERS = 'orders',
  ORDER_ITEMS = 'order_items',
  
  // Sales & POS
  SALES = 'sales',
  POS = 'pos',
  
  // Payment Management
  PAYMENTS = 'payments',
  TRANSACTIONS = 'transactions',
  
  // Credit Management
  CREDIT_APPLICATIONS = 'credit_applications',
  CREDIT_ASSESSMENT = 'credit_assessment',
  
  // Reports & Analytics
  REPORTS = 'reports',
  ANALYTICS = 'analytics',
  DASHBOARD = 'dashboard',
  
  // System Administration
  SYSTEM = 'system',
  AUDIT_LOGS = 'audit_logs',
  SETTINGS = 'settings'
}

export enum Action {
  // CRUD Operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Special Actions
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  ASSIGN = 'assign',
  REVOKE = 'revoke',
  
  // Financial Actions
  PROCESS_PAYMENT = 'process_payment',
  REFUND = 'refund',
  VOID = 'void',
  
  // Credit Actions
  ASSESS_CREDIT = 'assess_credit',
  DISBURSE = 'disburse',
  COLLECT = 'collect',
  
  // Admin Actions
  MANAGE = 'manage',
  CONFIGURE = 'configure',
  MONITOR = 'monitor'
}

export interface PermissionDefinition {
  name: string
  resource: Resource
  action: Action
  description: string
  businessSpecific: boolean
}

// Complete Permission Matrix
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // ==================== USER MANAGEMENT ====================
  {
    name: 'users.create',
    resource: Resource.USERS,
    action: Action.CREATE,
    description: 'Create new users in the system',
    businessSpecific: true
  },
  {
    name: 'users.read',
    resource: Resource.USERS,
    action: Action.READ,
    description: 'View user information',
    businessSpecific: true
  },
  {
    name: 'users.update',
    resource: Resource.USERS,
    action: Action.UPDATE,
    description: 'Update user information',
    businessSpecific: true
  },
  {
    name: 'users.delete',
    resource: Resource.USERS,
    action: Action.DELETE,
    description: 'Delete users from the system',
    businessSpecific: true
  },
  {
    name: 'employees.manage',
    resource: Resource.EMPLOYEES,
    action: Action.MANAGE,
    description: 'Manage employee accounts and roles',
    businessSpecific: true
  },
  {
    name: 'customers.read',
    resource: Resource.CUSTOMERS,
    action: Action.READ,
    description: 'View customer information',
    businessSpecific: true
  },
  {
    name: 'customers.update',
    resource: Resource.CUSTOMERS,
    action: Action.UPDATE,
    description: 'Update customer information',
    businessSpecific: true
  },

  // ==================== BUSINESS MANAGEMENT ====================
  {
    name: 'business.create',
    resource: Resource.BUSINESS,
    action: Action.CREATE,
    description: 'Create new business',
    businessSpecific: false // Global permission - anyone can create business
  },
  {
    name: 'business.read',
    resource: Resource.BUSINESS,
    action: Action.READ,
    description: 'View business information',
    businessSpecific: true
  },
  {
    name: 'business.update',
    resource: Resource.BUSINESS,
    action: Action.UPDATE,
    description: 'Update business information',
    businessSpecific: true
  },
  {
    name: 'business.delete',
    resource: Resource.BUSINESS,
    action: Action.DELETE,
    description: 'Delete business',
    businessSpecific: true
  },
  {
    name: 'business_settings.manage',
    resource: Resource.BUSINESS_SETTINGS,
    action: Action.MANAGE,
    description: 'Manage business settings and configuration',
    businessSpecific: true
  },

  // ==================== PRODUCT MANAGEMENT ====================
  {
    name: 'products.create',
    resource: Resource.PRODUCTS,
    action: Action.CREATE,
    description: 'Add new products to inventory',
    businessSpecific: true
  },
  {
    name: 'products.read',
    resource: Resource.PRODUCTS,
    action: Action.READ,
    description: 'View product information',
    businessSpecific: true
  },
  {
    name: 'products.update',
    resource: Resource.PRODUCTS,
    action: Action.UPDATE,
    description: 'Update product information and pricing',
    businessSpecific: true
  },
  {
    name: 'products.delete',
    resource: Resource.PRODUCTS,
    action: Action.DELETE,
    description: 'Remove products from inventory',
    businessSpecific: true
  },
  {
    name: 'categories.manage',
    resource: Resource.CATEGORIES,
    action: Action.MANAGE,
    description: 'Manage product categories',
    businessSpecific: true
  },
  {
    name: 'inventory.read',
    resource: Resource.INVENTORY,
    action: Action.READ,
    description: 'View inventory levels and status',
    businessSpecific: true
  },
  {
    name: 'inventory.update',
    resource: Resource.INVENTORY,
    action: Action.UPDATE,
    description: 'Update inventory levels and stock',
    businessSpecific: true
  },

  // ==================== SERVICE MANAGEMENT ====================
  {
    name: 'services.create',
    resource: Resource.SERVICES,
    action: Action.CREATE,
    description: 'Add new services',
    businessSpecific: true
  },
  {
    name: 'services.read',
    resource: Resource.SERVICES,
    action: Action.READ,
    description: 'View service information',
    businessSpecific: true
  },
  {
    name: 'services.update',
    resource: Resource.SERVICES,
    action: Action.UPDATE,
    description: 'Update service information',
    businessSpecific: true
  },
  {
    name: 'services.delete',
    resource: Resource.SERVICES,
    action: Action.DELETE,
    description: 'Remove services',
    businessSpecific: true
  },

  // ==================== ORDER MANAGEMENT ====================
  {
    name: 'orders.create',
    resource: Resource.ORDERS,
    action: Action.CREATE,
    description: 'Create new orders',
    businessSpecific: true
  },
  {
    name: 'orders.read',
    resource: Resource.ORDERS,
    action: Action.READ,
    description: 'View order information',
    businessSpecific: true
  },
  {
    name: 'orders.update',
    resource: Resource.ORDERS,
    action: Action.UPDATE,
    description: 'Update order status and information',
    businessSpecific: true
  },
  {
    name: 'orders.delete',
    resource: Resource.ORDERS,
    action: Action.DELETE,
    description: 'Cancel or delete orders',
    businessSpecific: true
  },

  // ==================== SALES & POS ====================
  {
    name: 'sales.read',
    resource: Resource.SALES,
    action: Action.READ,
    description: 'View sales data and transactions',
    businessSpecific: true
  },
  {
    name: 'sales.export',
    resource: Resource.SALES,
    action: Action.EXPORT,
    description: 'Export sales reports',
    businessSpecific: true
  },
  {
    name: 'pos.create',
    resource: Resource.POS,
    action: Action.CREATE,
    description: 'Process POS transactions',
    businessSpecific: true
  },
  {
    name: 'pos.read',
    resource: Resource.POS,
    action: Action.READ,
    description: 'View POS transaction history',
    businessSpecific: true
  },

  // ==================== PAYMENT MANAGEMENT ====================
  {
    name: 'payments.create',
    resource: Resource.PAYMENTS,
    action: Action.CREATE,
    description: 'Process payments',
    businessSpecific: true
  },
  {
    name: 'payments.read',
    resource: Resource.PAYMENTS,
    action: Action.READ,
    description: 'View payment information',
    businessSpecific: true
  },
  {
    name: 'payments.process_payment',
    resource: Resource.PAYMENTS,
    action: Action.PROCESS_PAYMENT,
    description: 'Process and authorize payments',
    businessSpecific: true
  },
  {
    name: 'payments.refund',
    resource: Resource.PAYMENTS,
    action: Action.REFUND,
    description: 'Process payment refunds',
    businessSpecific: true
  },

  // ==================== CREDIT MANAGEMENT ====================
  {
    name: 'credit_applications.read',
    resource: Resource.CREDIT_APPLICATIONS,
    action: Action.READ,
    description: 'View credit applications',
    businessSpecific: true
  },
  {
    name: 'credit_applications.create',
    resource: Resource.CREDIT_APPLICATIONS,
    action: Action.CREATE,
    description: 'Submit credit applications',
    businessSpecific: true
  },
  {
    name: 'credit_applications.approve',
    resource: Resource.CREDIT_APPLICATIONS,
    action: Action.APPROVE,
    description: 'Approve credit applications',
    businessSpecific: true
  },
  {
    name: 'credit_applications.reject',
    resource: Resource.CREDIT_APPLICATIONS,
    action: Action.REJECT,
    description: 'Reject credit applications',
    businessSpecific: true
  },
  {
    name: 'credit_assessment.assess_credit',
    resource: Resource.CREDIT_ASSESSMENT,
    action: Action.ASSESS_CREDIT,
    description: 'Perform credit risk assessment',
    businessSpecific: true
  },

  // ==================== REPORTS & ANALYTICS ====================
  {
    name: 'reports.read',
    resource: Resource.REPORTS,
    action: Action.READ,
    description: 'View business reports',
    businessSpecific: true
  },
  {
    name: 'reports.export',
    resource: Resource.REPORTS,
    action: Action.EXPORT,
    description: 'Export reports and data',
    businessSpecific: true
  },
  {
    name: 'analytics.read',
    resource: Resource.ANALYTICS,
    action: Action.READ,
    description: 'View analytics and insights',
    businessSpecific: true
  },
  {
    name: 'dashboard.read',
    resource: Resource.DASHBOARD,
    action: Action.READ,
    description: 'Access dashboard and metrics',
    businessSpecific: true
  },
  {
    name: 'dashboard.admin_view',
    resource: Resource.DASHBOARD,
    action: Action.READ,
    description: 'Access admin dashboard widgets and advanced metrics',
    businessSpecific: true
  },

  // ==================== SYSTEM ADMINISTRATION ====================
  {
    name: 'system.manage',
    resource: Resource.SYSTEM,
    action: Action.MANAGE,
    description: 'System administration privileges',
    businessSpecific: false
  },
  {
    name: 'audit_logs.read',
    resource: Resource.AUDIT_LOGS,
    action: Action.READ,
    description: 'View system audit logs',
    businessSpecific: true
  },
  {
    name: 'settings.manage',
    resource: Resource.SETTINGS,
    action: Action.MANAGE,
    description: 'Manage system settings',
    businessSpecific: true
  }
]

// Role-based permission assignments
export const ROLE_PERMISSIONS = {
  ADMIN: [
    // Full system access
    'users.create', 'users.read', 'users.update', 'users.delete',
    'employees.manage',
    'customers.read', 'customers.update',
    'business.create', 'business.read', 'business.update', 'business.delete',
    'business_settings.manage',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'categories.manage',
    'inventory.read', 'inventory.update',
    'services.create', 'services.read', 'services.update', 'services.delete',
    'orders.create', 'orders.read', 'orders.update', 'orders.delete',
    'sales.read', 'sales.export',
    'pos.create', 'pos.read',
    'payments.create', 'payments.read', 'payments.process_payment', 'payments.refund',
    'credit_applications.read', 'credit_applications.create', 'credit_applications.approve', 'credit_applications.reject',
    'credit_assessment.assess_credit',
    'reports.read', 'reports.export',
    'analytics.read',
    'dashboard.read', 'dashboard.admin_view',
    'audit_logs.read',
    'settings.manage'
  ],
  
  MANAGER: [
    // Management level access
    'users.read',
    'employees.manage',
    'customers.read', 'customers.update',
    'business.create', 'business.read',
    'products.create', 'products.read', 'products.update',
    'categories.manage',
    'inventory.read', 'inventory.update',
    'services.create', 'services.read', 'services.update',
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
    // Operational level access
    'business.create', 'business.read',
    'customers.read',
    'products.read',
    'inventory.read',
    'services.read',
    'orders.create', 'orders.read', 'orders.update',
    'sales.read',
    'pos.create', 'pos.read',
    'payments.create', 'payments.read', 'payments.process_payment',
    'credit_applications.create', 'credit_applications.read',
    'dashboard.read'
  ],
  
  CUSTOMER: [
    // Customer self-service access
    'orders.read',
    'payments.read',
    'credit_applications.create', 'credit_applications.read'
  ]
}

export function getPermissionName(resource: Resource, action: Action): string {
  return `${resource}.${action}`
}

export function getPermissionsForRole(role: keyof typeof ROLE_PERMISSIONS): string[] {
  return ROLE_PERMISSIONS[role] || []
}

export function isBusinessSpecificPermission(permissionName: string): boolean {
  const permission = PERMISSION_DEFINITIONS.find(p => p.name === permissionName)
  return permission?.businessSpecific ?? true
} 