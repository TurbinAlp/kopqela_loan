'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useNotifications } from '../../contexts/NotificationContext'
import AddUserModal from '../../components/AddUserModal'
import EditUserModal from '../../components/EditUserModal'
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal'
import PermissionGate from '../../components/auth/PermissionGate'

interface User {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  status: 'Active' | 'Inactive'
  lastLogin: string
  firstName?: string
  lastName?: string
  phone?: string
  isOwner?: boolean
}

function UserManagementPageContent() {
  const { language } = useLanguage()
  const { currentBusiness } = useBusiness()
  const { showSuccess, showError } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null as number | null,
    userName: ''
  })

  // Load users when component mounts and when business changes
  const loadUsers = useCallback(async () => {
    if (!currentBusiness?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users?businessId=${currentBusiness.id}`)
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data || [])
      } else {
        console.error('Failed to load users:', data.message)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness?.id])

  useEffect(() => {
    setIsVisible(true)
    loadUsers()
  }, [currentBusiness?.id, loadUsers])

  const translations = {
    en: {
      pageTitle: "User Management",
      pageSubtitle: "Manage system users, roles, and permissions",
      
      // User Management
      addUser: "Add New User",
      editUser: "Edit User",
      deleteUser: "Delete User",
      userName: "Full Name",
      userEmail: "Email Address",
      userRole: "Role",
      userStatus: "Status",
      lastLogin: "Last Login",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      admin: "Admin",
      manager: "Manager",
      cashier: "Cashier",
      permissions: "Permissions",
      
      // Messages
      saved: "Settings saved successfully",
      userAdded: "User added successfully",
      userUpdated: "User updated successfully",
      userDeleted: "User removed from business successfully",
      confirmDelete: "Remove User from Business",
      deleteMessage: "Are you sure you want to remove this user from the business? This action can be undone by re-adding the user.",
      deleteError: "Error removing user. Please try again.",
      loading: "Loading users..."
    },
    sw: {
      pageTitle: "Usimamizi wa Watumiaji",
      pageSubtitle: "Simamia watumiaji wa mfumo, majukumu, na ruhusa",
      
      // User Management
      addUser: "Ongeza Mtumiaji Mpya",
      editUser: "Hariri Mtumiaji",
      deleteUser: "Futa Mtumiaji",
      userName: "Jina Kamili",
      userEmail: "Barua Pepe",
      userRole: "Jukumu",
      userStatus: "Hali",
      lastLogin: "Mwingio wa Mwisho",
      actions: "Vitendo",
      active: "Amilifu",
      inactive: "Sio Amilifu",
      admin: "Msimamizi",
      manager: "Meneja",
      cashier: "Mwajiri",
      permissions: "Ruhusa",
      
      // Messages
      saved: "Mipangilio imehifadhiwa",
      userAdded: "Mtumiaji ameongezwa",
      userUpdated: "Mtumiaji ameharirifwa",
      userDeleted: "Mtumiaji ameondolewa kutoka biashara kwa ufanisi",
      confirmDelete: "Ondoa Mtumiaji kutoka Biashara",
      deleteMessage: "Je, una uhakika unataka kumondoa mtumiaji huyu kutoka biashara? Kitendo hiki kinaweza kubatilishwa kwa kumuongeza tena.",
      deleteError: "Kuna tatizo la kumondoa mtumiaji. Jaribu tena.",
      loading: "Inapakia watumiaji..."
    }
  }

  const t = translations[language]

  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [...prev, newUser])
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditUserModalOpen(true)
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
  }

  const handleDeleteUser = (userId: number, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId: userId,
      userName: userName
    })
  }

  const handleDeleteClose = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: ''
    })
  }

  const handleDeleteConfirm = async () => {
    if (!currentBusiness?.id || !deleteModal.userId) return
    
    try {
      const response = await fetch(`/api/admin/users/${deleteModal.userId}?businessId=${currentBusiness.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove user from list or update status
        setUsers(prev => prev.filter(user => user.id !== deleteModal.userId))
        showSuccess('Success', t.userDeleted)
      } else {
        showError('Error', data.message || t.deleteError)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showError('Error', t.deleteError)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="text-gray-600">{t.pageSubtitle}</p>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* User Management Content */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Add User Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5 text-white" />
              <span className="text-white">{t.addUser}</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t.pageTitle}</h3>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">{t.loading}</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found for this business
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">{t.userName}</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">{t.userEmail}</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">{t.userRole}</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">{t.userStatus}</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">{t.lastLogin}</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-4 px-6 text-gray-900">
                          {user.name}
                          {user.isOwner && (
                            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Owner
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-900">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'ADMIN' ? t.admin : 
                             user.role === 'MANAGER' ? t.manager : 
                             t.cashier}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'Active' ? t.active : t.inactive}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-900">{user.lastLogin}</td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                              title={t.editUser}
                              disabled={isLoading}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {!user.isOwner && (
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded" 
                                title={t.deleteUser}
                                disabled={isLoading}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
        businessId={currentBusiness?.id}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
        businessId={currentBusiness?.id}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete}
        message={t.deleteMessage}
        itemName={deleteModal.userName}
      />
    </motion.div>
  )
}

export default function UserManagementPage() {
  return (
    <PermissionGate requiredPermission="users.read">
      <UserManagementPageContent />
    </PermissionGate>
  )
} 