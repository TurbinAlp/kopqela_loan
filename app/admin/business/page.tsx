'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'



export default function BusinessPage() {
  const { language } = useLanguage()
  const { businesses, isLoading } = useBusiness()
  const router = useRouter()

  const translations = {
    en: {
      addBusiness: 'Add New Business',
      noBusiness: 'No businesses found',
      businessName: 'Business Name',
      businessType: 'Type',
      location: 'Location',
      employees: 'Employees',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      createdOn: 'Created',
      viewBusiness: 'View Business',
      editBusiness: 'Edit Business',
      deleteBusiness: 'Delete Business',
      manageBusiness: 'Manage Business',
      loadingError: 'Failed to load businesses'
    },
    sw: {
      addBusiness: 'Ongeza Biashara Mpya',
      noBusiness: 'Hakuna biashara zilizopatikana',
      businessName: 'Jina la Biashara',
      businessType: 'Aina',
      location: 'Mahali',
      employees: 'Wafanyakazi',
      status: 'Hali',
      actions: 'Vitendo',
      active: 'Amilifu',
      inactive: 'Sio Amilifu',
      createdOn: 'Iliundwa',
      viewBusiness: 'Angalia Biashara',
      editBusiness: 'Hariri Biashara',
      deleteBusiness: 'Futa Biashara',
      manageBusiness: 'Simamia Biashara',
      loadingError: 'Imeshindwa kupakia biashara'
    }
  }

  const t = translations[language]

  // Businesses are loaded automatically by BusinessContext

  const handleAddBusiness = () => {
    router.push('/admin/business/add')
  }

  const handleViewBusiness = (business: { id: number; slug: string }) => {
    // Navigate to business dashboard
    console.log('View business:', business.slug)
  }

  const handleEditBusiness = (business: { id: number }) => {
    // Navigate to edit business form  
    router.push(`/admin/business/edit?id=${business.id}`)
  }

  const handleDeleteBusiness = (business: { id: number; slug: string }) => {
    // Delete business with confirmation
    console.log('Delete business:', business.slug)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Action Bar */}
      <div className="mb-8">
        <div className="flex justify-end">
          <button
            onClick={handleAddBusiness}
            className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t.addBusiness}</span>
          </button>
        </div>
      </div>

      {/* Businesses List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noBusiness}</h3>
          <button
            onClick={handleAddBusiness}
            className="inline-flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t.addBusiness}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-900">
                <div>{t.businessName}</div>
                <div>{t.businessType}</div>
                <div>{t.location}</div>
                <div>{t.employees}</div>
                <div>{t.status}</div>
                <div>{t.actions}</div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {businesses.map((business) => (
                <div key={business.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{business.name}</h3>
                          <p className="text-sm text-gray-500">{business.businessSetting?.description || business.businessType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-900">{business.businessType}</div>
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{business.businessSetting?.city || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        <span>1</span>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t.active}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewBusiness(business)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.viewBusiness}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditBusiness(business)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={t.editBusiness}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.deleteBusiness}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {businesses.map((business) => (
              <div key={business.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BuildingOfficeIcon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{business.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t.active}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{business.businessSetting?.description || business.businessType}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>{business.businessType}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span>{business.businessSetting?.city || 'N/A'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <UserGroupIcon className="w-3 h-3" />
                        <span>1</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewBusiness(business)}
                        className="flex-1 bg-teal-50 text-teal-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                      >
                        {t.manageBusiness}
                      </button>
                      <button
                        onClick={() => handleEditBusiness(business)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={t.editBusiness}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.deleteBusiness}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
} 