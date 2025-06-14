'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import AddUserModal from '../../components/AddUserModal'
import EditUserModal from '../../components/EditUserModal'

export default function UserManagementPage() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email: string; role: 'Admin' | 'Manager' | 'Cashier'; status: 'Active' | 'Inactive'; lastLogin: string } | null>(null)

  const [users, setUsers] = useState<{ id: number; name: string; email: string; role: 'Admin' | 'Manager' | 'Cashier'; status: 'Active' | 'Inactive'; lastLogin: string }[]>([
    { id: 1, name: 'John Admin', email: 'john@kopqela.com', role: 'Admin' as const, status: 'Active' as const, lastLogin: '2024-01-15' },
    { id: 2, name: 'Mary Cashier', email: 'mary@kopqela.com', role: 'Cashier' as const, status: 'Active' as const, lastLogin: '2024-01-14' },
    { id: 3, name: 'Peter Manager', email: 'peter@kopqela.com', role: 'Manager' as const, status: 'Inactive' as const, lastLogin: '2024-01-10' }
  ])

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
      userUpdated: "User updated successfully"
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
      userUpdated: "Mtumiaji ameharirifwa"
    }
  }

  const t = translations[language]

  const handleUserAdded = (newUser: { id: number; name: string; email: string; role: 'Admin' | 'Manager' | 'Cashier'; status: 'Active' | 'Inactive'; lastLogin: string }) => {
    setUsers(prev => [...prev, newUser])
  }

  const handleEditUser = (user: { id: number; name: string; email: string; role: 'Admin' | 'Manager' | 'Cashier'; status: 'Active' | 'Inactive'; lastLogin: string }) => {
    setSelectedUser(user)
    setIsEditUserModalOpen(true)
  }

  const handleUserUpdated = (updatedUser: { id: number; name: string; email: string; role: 'Admin' | 'Manager' | 'Cashier'; status: 'Active' | 'Inactive'; lastLogin: string }) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
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
              <UserPlusIcon className="w-5 h-5" />
              <span>{t.addUser}</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t.pageTitle}</h3>
            </div>
            <div className="overflow-x-auto">
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
                      <td className="py-4 px-6 text-gray-900">{user.name}</td>
                      <td className="py-4 px-6 text-gray-900">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">{user.lastLogin}</td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                            title={t.editUser}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded" title={t.deleteUser}>
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
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />
    </motion.div>
  )
} 