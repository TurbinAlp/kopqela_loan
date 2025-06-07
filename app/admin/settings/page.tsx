'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  LanguageIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  BellIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  KeyIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import AddUserModal from '../../components/AddUserModal'
import EditUserModal from '../../components/EditUserModal'

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email: string; role: 'Admin' | 'Manager' | 'Cashier'; status: 'Active' | 'Inactive'; lastLogin: string } | null>(null)

  // Form states
  const [businessSettings, setBusinessSettings] = useState({
    name: 'Kopqela Business Solutions',
    email: 'info@kopqela.com',
    phone: '+255 123 456 789',
    address: 'Dar es Salaam, Tanzania',
    openTime: '08:00',
    closeTime: '18:00',
    currency: 'TZS',
    timezone: 'Africa/Dar_es_Salaam'
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@kopqela.com',
    smtpPassword: '',
    fromName: 'Kopqela System',
    fromEmail: 'noreply@kopqela.com'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    paymentReminders: true,
    newOrderAlerts: true,
    systemUpdates: false
  })

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
      pageTitle: "Settings",
      pageSubtitle: "Manage system settings and configurations",
      
      // Tabs
      userManagement: "User Management",
      businessSettings: "Business Settings",
      languageSettings: "Language Settings", 
      systemSettings: "System Settings",
      
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
      
      // Business Settings
      businessInfo: "Business Information",
      businessName: "Business Name",
      businessEmail: "Business Email",
      businessPhone: "Phone Number",
      businessAddress: "Address",
      businessHours: "Business Hours",
      openTime: "Opening Time",
      closeTime: "Closing Time",
      currency: "Currency",
      timezone: "Timezone",
      
      // Language Settings
      defaultLanguage: "Default Language",
      english: "English",
      swahili: "Swahili",
      currentLanguage: "Current Language",
      
      // System Settings
      emailConfig: "Email Configuration",
      smtpHost: "SMTP Host",
      smtpPort: "SMTP Port",
      smtpUser: "SMTP Username",
      smtpPassword: "SMTP Password",
      fromName: "From Name",
      fromEmail: "From Email",
      
      // Notifications
      notifications: "Notification Settings",
      emailNotifications: "Email Notifications",
      smsNotifications: "SMS Notifications",
      lowStockAlerts: "Low Stock Alerts",
      paymentReminders: "Payment Reminders",
      newOrderAlerts: "New Order Alerts",
      systemUpdates: "System Updates",
      
      // Security
      security: "Security Settings",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      enableTwoFactor: "Enable Two-Factor Authentication",
      
      // Backup
      backup: "Backup & Recovery",
      lastBackup: "Last Backup",
      createBackup: "Create Backup",
      restoreBackup: "Restore Backup",
      autoBackup: "Automatic Backup",
      
      // Actions
      save: "Save Changes",
      cancel: "Cancel",
      saving: "Saving...",
      saved: "Settings saved successfully",
      showPassword: "Show Password",
      hidePassword: "Hide Password",
      testConnection: "Test Connection"
    },
    sw: {
      pageTitle: "Mipangilio",
      pageSubtitle: "Simamia mipangilio ya mfumo",
      
      // Tabs
      userManagement: "Usimamizi wa Watumiaji",
      businessSettings: "Mipangilio ya Biashara",
      languageSettings: "Mipangilio ya Lugha",
      systemSettings: "Mipangilio ya Mfumo",
      
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
      
      // Business Settings
      businessInfo: "Maelezo ya Biashara",
      businessName: "Jina la Biashara",
      businessEmail: "Barua Pepe ya Biashara",
      businessPhone: "Namba ya Simu",
      businessAddress: "Anwani",
      businessHours: "Masaa ya Biashara",
      openTime: "Muda wa Kufungua",
      closeTime: "Muda wa Kufunga",
      currency: "Sarafu",
      timezone: "Saa za Eneo",
      
      // Language Settings
      defaultLanguage: "Lugha Chaguo-msingi",
      english: "Kiingereza",
      swahili: "Kiswahili",
      currentLanguage: "Lugha ya Sasa",
      
      // System Settings
      emailConfig: "Usanidi wa Barua Pepe",
      smtpHost: "SMTP Host",
      smtpPort: "SMTP Port",
      smtpUser: "Jina la Mtumiaji wa SMTP",
      smtpPassword: "Nywila ya SMTP",
      fromName: "Jina la Mtumaji",
      fromEmail: "Barua Pepe ya Mtumaji",
      
      // Notifications
      notifications: "Mipangilio ya Arifa",
      emailNotifications: "Arifa za Barua Pepe",
      smsNotifications: "Arifa za SMS",
      lowStockAlerts: "Arifa za Hisa Ndogo",
      paymentReminders: "Vikumbuzi vya Malipo",
      newOrderAlerts: "Arifa za Maagizo Mapya",
      systemUpdates: "Masasisho ya Mfumo",
      
      // Security
      security: "Mipangilio ya Usalama",
      changePassword: "Badilisha Nywila",
      currentPassword: "Nywila ya Sasa",
      newPassword: "Nywila Mpya",
      confirmPassword: "Thibitisha Nywila",
      enableTwoFactor: "Washa Uthibitisho wa Hatua Mbili",
      
      // Backup
      backup: "Hifadhi na Urejeshaji",
      lastBackup: "Hifadhi ya Mwisho",
      createBackup: "Tengeneza Hifadhi",
      restoreBackup: "Rejesha Hifadhi",
      autoBackup: "Hifadhi Otomatiki",
      
      // Actions
      save: "Hifadhi Mabadiliko",
      cancel: "Ghairi",
      saving: "Inahifadhi...",
      saved: "Mipangilio imehifadhiwa",
      showPassword: "Onyesha Nywila",
      hidePassword: "Ficha Nywila",
      testConnection: "Jaribu Muunganisho"
    }
  }

  const t = translations[language]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
  }

  const handleBusinessSettingChange = (field: string, value: string) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmailSettingChange = (field: string, value: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

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
        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-2 sm:px-0">
                {[
                  { id: 'users', label: t.userManagement, icon: UserGroupIcon },
                  { id: 'business', label: t.businessSettings, icon: BuildingOfficeIcon },
                  { id: 'language', label: t.languageSettings, icon: LanguageIcon },
                  { id: 'system', label: t.systemSettings, icon: CogIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
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
          </div>
        </motion.div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
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
                <h3 className="text-lg font-semibold text-gray-900">{t.userManagement}</h3>
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
        )}

        {/* Business Settings Tab */}
        {activeTab === 'business' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.businessInfo}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessName}</label>
                  <input
                    type="text"
                    value={businessSettings.name}
                    onChange={(e) => handleBusinessSettingChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessEmail}</label>
                  <input
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => handleBusinessSettingChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessPhone}</label>
                  <input
                    type="tel"
                    value={businessSettings.phone}
                    onChange={(e) => handleBusinessSettingChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.currency}</label>
                  <select
                    value={businessSettings.currency}
                    onChange={(e) => handleBusinessSettingChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="TZS">TZS - Tanzanian Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.businessAddress}</label>
                <textarea
                  value={businessSettings.address}
                  onChange={(e) => handleBusinessSettingChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">{t.businessHours}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.openTime}</label>
                    <input
                      type="time"
                      value={businessSettings.openTime}
                      onChange={(e) => handleBusinessSettingChange('openTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.closeTime}</label>
                    <input
                      type="time"
                      value={businessSettings.closeTime}
                      onChange={(e) => handleBusinessSettingChange('closeTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Language Settings Tab */}
        {activeTab === 'language' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.languageSettings}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.currentLanguage}</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                        language === 'en' 
                          ? 'border-teal-500 bg-teal-50 text-teal-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">🇺🇸</span>
                      <span>{t.english}</span>
                    </button>
                    
                    <button
                      onClick={() => setLanguage('sw')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                        language === 'sw' 
                          ? 'border-teal-500 bg-teal-50 text-teal-700' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">🇹🇿</span>
                      <span>{t.swahili}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Email Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <EnvelopeIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.emailConfig}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.smtpHost}</label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => handleEmailSettingChange('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.smtpPort}</label>
                  <input
                    type="text"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailSettingChange('smtpPort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.smtpUser}</label>
                  <input
                    type="email"
                    value={emailSettings.smtpUser}
                    onChange={(e) => handleEmailSettingChange('smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.smtpPassword}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={emailSettings.smtpPassword}
                      onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BellIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.notifications}</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: t.emailNotifications },
                  { key: 'smsNotifications', label: t.smsNotifications },
                  { key: 'lowStockAlerts', label: t.lowStockAlerts },
                  { key: 'paymentReminders', label: t.paymentReminders },
                  { key: 'newOrderAlerts', label: t.newOrderAlerts },
                  { key: 'systemUpdates', label: t.systemUpdates }
                ].map((setting) => (
                  <label key={setting.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                    <input
                      type="checkbox"
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                      onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                      className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ShieldCheckIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.security}</h3>
              </div>
              
              <div className="space-y-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors">
                  <KeyIcon className="w-5 h-5" />
                  <span>{t.changePassword}</span>
                </button>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t.enableTwoFactor}</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>

            {/* Backup Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ServerIcon className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t.backup}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{t.lastBackup}: 2024-01-15 14:30</span>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                    {t.createBackup}
                  </button>
                </div>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t.autoBackup}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t.saving}</span>
                </>
              ) : (
                <span>{t.save}</span>
              )}
            </button>
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