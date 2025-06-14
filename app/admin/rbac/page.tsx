'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { WithPermission } from '../../hooks/usePermissions'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  businessId?: number
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string
  isActive: boolean
}

export default function RBACManagementPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    en: {
      rbacManagement: "Access Control Management",
      pageDescription: "Manage user roles, permissions, and access control",
      users: "Users",
      roles: "Roles",
      permissions: "Permissions",
      
      // User Management
      userManagement: "User Management",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      adminUsers: "Admin Users",
      viewUser: "View User",
      editUser: "Edit User",
      deleteUser: "Delete User",
      addUser: "Add User",
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      lastLogin: "Last Login",
      created: "Created",
      active: "Active",
      inactive: "Inactive",
      
      // Role Management
      roleManagement: "Role Management",
      administrator: "Administrator",
      manager: "Manager",
      cashier: "Cashier",
      customer: "Customer",
      assignedPermissions: "Assigned Permissions",
      managePermissions: "Manage Permissions",
      
      // Permission Management
      permissionManagement: "Permission Management",
      permissionName: "Permission Name",
      resource: "Resource",
      action: "Action",
      description: "Description",
      addPermission: "Add Permission",
      editPermission: "Edit Permission",
      deletePermission: "Delete Permission",
      
      // Common
      search: "Search...",
      filter: "Filter",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      loading: "Loading...",
      noData: "No data available",
      error: "Error occurred",
      success: "Success",
      
      // Error Messages
      unauthorized: "You don't have permission to access this page",
      loadingError: "Error loading data",
      saveError: "Error saving changes",
      deleteError: "Error deleting item"
    },
    sw: {
      rbacManagement: "Msimamizi wa Udhibiti wa Ufikiaji",
      pageDescription: "Simamia jukumu za watumiaji, ruhusa, na udhibiti wa ufikiaji",
      users: "Watumiaji",
      roles: "Majukumu",
      permissions: "Ruhusa",
      
      // User Management
      userManagement: "Usimamizi wa Watumiaji",
      totalUsers: "Watumiaji Wote",
      activeUsers: "Watumiaji Hai",
      adminUsers: "Watumiaji Wasimamizi",
      viewUser: "Ona Mtumiaji",
      editUser: "Hariri Mtumiaji",
      deleteUser: "Futa Mtumiaji",
      addUser: "Ongeza Mtumiaji",
      name: "Jina",
      email: "Barua Pepe",
      role: "Jukumu",
      status: "Hali",
      lastLogin: "Kuingia Mwisho",
      created: "Iliyotengenezwa",
      active: "Hai",
      inactive: "Si Hai",
      
      // Role Management
      roleManagement: "Usimamizi wa Majukumu",
      administrator: "Msimamizi",
      manager: "Meneja",
      cashier: "Mwajiri",
      customer: "Mteja",
      assignedPermissions: "Ruhusa Zilizopewa",
      managePermissions: "Simamia Ruhusa",
      
      // Permission Management
      permissionManagement: "Usimamizi wa Ruhusa",
      permissionName: "Jina la Ruhusa",
      resource: "Rasilimali",
      action: "Kitendo",
      description: "Maelezo",
      addPermission: "Ongeza Ruhusa",
      editPermission: "Hariri Ruhusa",
      deletePermission: "Futa Ruhusa",
      
      // Common
      search: "Tafuta...",
      filter: "Chuja",
      actions: "Vitendo",
      save: "Hifadhi",
      cancel: "Ghairi",
      delete: "Futa",
      edit: "Hariri",
      view: "Ona",
      loading: "Inapakia...",
      noData: "Hakuna data",
      error: "Hitilafu imetokea",
      success: "Mafanikio",
      
      // Error Messages
      unauthorized: "Huna ruhusa ya kufikia ukurasa huu",
      loadingError: "Hitilafu katika kupakia data",
      saveError: "Hitilafu katika kuhifadhi mabadiliko",
      deleteError: "Hitilafu katika kufuta kipengee"
    }
  }

  const t = translations[language]

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (activeTab === 'users') {
        await loadUsers()
      } else if (activeTab === 'permissions') {
        await loadPermissions()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError(t.loadingError)
    } finally {
      setLoading(false)
    }
  }, [activeTab, t.loadingError])

  useEffect(() => {
    loadData()
  }, [activeTab, loadData])

  const loadUsers = async () => {
    // Mock data for now - replace with actual API call
    const mockUsers: User[] = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "ADMIN",
        isActive: true,
        lastLoginAt: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: "MANAGER",
        isActive: true,
        lastLoginAt: "2024-01-14T14:20:00Z",
        createdAt: "2024-01-02T00:00:00Z"
      }
    ]
    setUsers(mockUsers)
  }

  const loadPermissions = async () => {
    // Mock data for now - replace with actual API call
    const mockPermissions: Permission[] = [
      {
        id: 1,
        name: "users.create",
        resource: "users",
        action: "create",
        description: "Create new users in the system",
        isActive: true
      },
      {
        id: 2,
        name: "products.read",
        resource: "products",
        action: "read",
        description: "View product information",
        isActive: true
      }
    ]
    setPermissions(mockPermissions)
  }

  const getUserStats = () => {
    const total = users.length
    const active = users.filter(u => u.isActive).length
    const admins = users.filter(u => u.role === 'ADMIN').length
    
    return { total, active, admins }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'CASHIER': return 'bg-green-100 text-green-800'
      case 'CUSTOMER': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return t.administrator
      case 'MANAGER': return t.manager
      case 'CASHIER': return t.cashier
      case 'CUSTOMER': return t.customer
      default: return role
    }
  }

  return (
    <WithPermission permission="system.manage" fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.unauthorized}</h3>
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{t.rbacManagement}</h1>
          <p className="mt-2 text-gray-600">{t.pageDescription}</p>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'users', label: t.users, icon: UserGroupIcon },
              { key: 'roles', label: t.roles, icon: ShieldCheckIcon },
              { key: 'permissions', label: t.permissions, icon: AdjustmentsHorizontalIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'users' | 'roles' | 'permissions')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">{t.loading}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* User Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: t.totalUsers, value: getUserStats().total, color: 'blue' },
                      { label: t.activeUsers, value: getUserStats().active, color: 'green' },
                      { label: t.adminUsers, value: getUserStats().admins, color: 'red' }
                    ].map((stat, index) => (
                      <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Users Table */}
                  <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{t.userManagement}</h3>
                        <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                          <PlusIcon className="w-4 h-4 mr-2" />
                          {t.addUser}
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.name}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.email}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.role}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.status}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.lastLogin}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t.actions}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                  {getRoleLabel(user.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.isActive ? t.active : t.inactive}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(user.lastLoginAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button className="text-teal-600 hover:text-teal-900">
                                    <EyeIcon className="w-4 h-4" />
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white shadow-sm rounded-lg border overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{t.permissionManagement}</h3>
                      <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {t.addPermission}
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.permissionName}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.resource}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.action}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.description}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.actions}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {permissions.map((permission) => (
                          <tr key={permission.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{permission.resource}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{permission.action}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{permission.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Roles Tab */}
              {activeTab === 'roles' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { role: 'ADMIN', label: t.administrator, color: 'red', count: 2 },
                      { role: 'MANAGER', label: t.manager, color: 'blue', count: 5 },
                      { role: 'CASHIER', label: t.cashier, color: 'green', count: 8 },
                      { role: 'CUSTOMER', label: t.customer, color: 'gray', count: 150 }
                    ].map((roleInfo) => (
                      <div key={roleInfo.role} className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{roleInfo.label}</h3>
                            <p className="text-2xl font-bold text-gray-900">{roleInfo.count}</p>
                          </div>
                          <ShieldCheckIcon className={`w-8 h-8 text-${roleInfo.color}-500`} />
                        </div>
                        <div className="mt-4">
                          <button className="text-sm text-teal-600 hover:text-teal-900">
                            {t.managePermissions}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </WithPermission>
  )
} 