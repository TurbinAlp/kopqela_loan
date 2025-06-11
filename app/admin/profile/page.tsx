'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ProfilePage() {
  const { language } = useLanguage()
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Administrator',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const translations = {
    en: {
      myProfile: "My Profile",
      personalInfo: "Personal Information",
      accountSecurity: "Account Security",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      fullName: "Full Name",
      emailAddress: "Email Address", 
      phoneNumber: "Phone Number",
      userRole: "User Role",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      changePassword: "Change Password",
      uploadPhoto: "Upload Photo",
      administrator: "Administrator",
      manager: "Manager",
      cashier: "Cashier",
      profileUpdated: "Profile updated successfully!",
      passwordChanged: "Password changed successfully!",
      errorUpdate: "Error updating profile",
      enterCurrentPassword: "Enter current password",
      enterNewPassword: "Enter new password",
      confirmNewPassword: "Confirm new password",
      passwordsMustMatch: "Passwords must match",
      passwordMinLength: "Password must be at least 6 characters"
    },
    sw: {
      myProfile: "Profaili Yangu",
      personalInfo: "Taarifa za Kibinafsi",
      accountSecurity: "Usalama wa Akaunti",
      editProfile: "Hariri Profaili",
      saveChanges: "Hifadhi Mabadiliko",
      cancel: "Ghairi",
      fullName: "Jina Kamili",
      emailAddress: "Anwani ya Barua Pepe",
      phoneNumber: "Nambari ya Simu",
      userRole: "Jukumu la Mtumiaji",
      currentPassword: "Nenosiri la Sasa",
      newPassword: "Nenosiri Jipya",
      confirmPassword: "Thibitisha Nenosiri Jipya",
      changePassword: "Badilisha Nenosiri",
      uploadPhoto: "Pakia Picha",
      administrator: "Msimamizi",
      manager: "Meneja",
      cashier: "Mwajiri",
      profileUpdated: "Profaili imesasishwa kwa mafanikio!",
      passwordChanged: "Nenosiri limebadilishwa kwa mafanikio!",
      errorUpdate: "Hitilafu katika kusasisha profaili",
      enterCurrentPassword: "Ingiza nenosiri la sasa",
      enterNewPassword: "Ingiza nenosiri jipya",
      confirmNewPassword: "Thibitisha nenosiri jipya",
      passwordsMustMatch: "Nenosiri lazima zilingane",
      passwordMinLength: "Nenosiri lazima liwe na herufi 6 au zaidi"
    }
  }

  const t = translations[language]

  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session?.user?.name || '',
        email: session?.user?.email || ''
      }))
    }
  }, [session])

  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ').map(name => name[0]).join('').toUpperCase()
    }
    return session?.user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getUserImage = () => {
    return session?.user?.image || null
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setIsEditing(false)
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert(t.passwordsMustMatch)
      return
    }
    
    if (profileData.newPassword.length < 6) {
      alert(t.passwordMinLength)
      return
    }

    setLoading(true)
    try {
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">{t.myProfile}</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full mx-auto overflow-hidden">
                    {getUserImage() ? (
                      <Image 
                        src={getUserImage()!} 
                        alt="Profile" 
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-4xl">
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <CameraIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {session?.user?.name || 'User'}
                </h2>
                <p className="text-gray-600">{t.administrator}</p>
                <button className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {t.uploadPhoto}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.personalInfo}</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    {t.editProfile}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      {t.saveChanges}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      {t.cancel}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.fullName}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.emailAddress}
                  </label>
                  <p className="text-gray-900">{profileData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phoneNumber}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.userRole}
                  </label>
                  <p className="text-gray-900">{t.administrator}</p>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.accountSecurity}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.currentPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData(prev => ({...prev, currentPassword: e.target.value}))}
                      placeholder={t.enterCurrentPassword}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.newPassword}
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({...prev, newPassword: e.target.value}))}
                    placeholder={t.enterNewPassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.confirmPassword}
                  </label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({...prev, confirmPassword: e.target.value}))}
                    placeholder={t.confirmNewPassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword}
                  className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {t.changePassword}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 