'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRightIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../../hooks/useRequireAuth'
import { useNotifications } from '../../../contexts/NotificationContext'
import Image from 'next/image'
import Spinner from '../../../components/ui/Spinner'

interface InventoryMovement {
  id: number
  productId: number
  product: {
    id: number
    name: string
    nameSwahili?: string
    sku?: string
    images?: { url: string }[]
  }
  fromLocation?: string
  toLocation: string
  quantity: number
  movementType: string
  reason?: string
  referenceId?: string
  user?: {
    id: number
    firstName: string
    lastName: string
  } | null
  createdAt: string
}

interface MovementsResponse {
  success: boolean
  data: {
    movements: InventoryMovement[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPreviousPage: boolean
      limit: number
    }
  }
}

export default function StockMovementHistoryPage() {
  const { language } = useLanguage()
  const { showError } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()

  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Filters
  const [movementType, setMovementType] = useState('all')
  const [fromLocation, setFromLocation] = useState('all')
  const [toLocation, setToLocation] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const translations = {
    en: {
      title: 'Stock Movement History',
      subtitle: 'Track all inventory movements and transfers',
      filters: 'Filters',
      movementType: 'Movement Type',
      fromLocation: 'From Location',
      toLocation: 'To Location',
      startDate: 'Start Date',
      endDate: 'End Date',
      allTypes: 'All Types',
      allLocations: 'All Locations',
      mainStore: 'Main Store',
      retailStore: 'Retail Store',
      sold: 'Sold',
      
      // Movement types
      transfer: 'Transfer',
      sale: 'Sale',
      adjustment: 'Adjustment',
      initial_stock: 'Initial Stock',
      
      // Table headers
      product: 'Product',
      movement: 'Movement',
      quantity: 'Quantity',
      type: 'Type',
      reason: 'Reason',
      reference: 'Reference',
      user: 'User',
      date: 'Date',
      
      // Pagination
      showing: 'Showing',
      of: 'of',
      results: 'results',
      previous: 'Previous',
      next: 'Next',
      
      // Messages
      noMovements: 'No Movement History',
      noMovementsDescription: 'No stock movements have been recorded yet.',
      loading: 'Loading movements...'
    },
    sw: {
      title: 'Historia ya Mabadiliko ya Hisa',
      subtitle: 'Fuatilia mabadiliko yote ya hisa na uhamishaji',
      filters: 'Vichujio',
      movementType: 'Aina ya Mabadiliko',
      fromLocation: 'Kutoka Mahali',
      toLocation: 'Kwenda Mahali',
      startDate: 'Tarehe ya Kuanza',
      endDate: 'Tarehe ya Mwisho',
      allTypes: 'Aina Zote',
      allLocations: 'Mahali Yote',
      mainStore: 'Hifadhi Kuu',
      retailStore: 'Duka la Nje',
      sold: 'Imeuzwa',
      
      // Movement types
      transfer: 'Uhamishaji',
      sale: 'Mauzo',
      adjustment: 'Marekebisho',
      initial_stock: 'Hisa ya Awali',
      
      // Table headers
      product: 'Bidhaa',
      movement: 'Mabadiliko',
      quantity: 'Idadi',
      type: 'Aina',
      reason: 'Sababu',
      reference: 'Kumbukumbu',
      user: 'Mtumiaji',
      date: 'Tarehe',
      
      // Pagination
      showing: 'Inaonyesha',
      of: 'ya',
      results: 'matokeo',
      previous: 'Iliyotangulia',
      next: 'Ifuatayo',
      
      // Messages
      noMovements: 'Hakuna Historia ya Mabadiliko',
      noMovementsDescription: 'Hakuna mabadiliko ya hisa yamerekodiwa bado.',
      loading: 'Inapakia mabadiliko...'
    }
  }

  const t = translations[language]

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchMovements = useCallback(async () => {
    if (!currentBusiness) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        businessId: currentBusiness.id.toString(),
        page: currentPage.toString(),
        limit: pagination.limit.toString()
      })

      if (movementType !== 'all') params.append('movementType', movementType)
      if (fromLocation !== 'all') params.append('fromLocation', fromLocation)
      if (toLocation !== 'all') params.append('toLocation', toLocation)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/inventory/movements?${params}`)
      const data: MovementsResponse = await response.json()

      if (response.ok && data.success) {
        setMovements(data.data.movements)
        setPagination(data.data.pagination)
      } else {
        throw new Error('Failed to fetch movements')
      }
    } catch (error) {
      console.error('Error fetching movements:', error)
      showError(
        language === 'sw' ? 'Hitilafu' : 'Error',
        language === 'sw' ? 'Imeshindwa kupata historia ya mabadiliko' : 'Failed to fetch movement history'
      )
    } finally {
      setLoading(false)
    }
  }, [currentBusiness, currentPage, pagination.limit, movementType, fromLocation, toLocation, startDate, endDate, language, showError])

  useEffect(() => {
    if (currentBusiness && mounted) {
      fetchMovements()
    }
  }, [currentBusiness, mounted, fetchMovements])

  const clearFilters = () => {
    setMovementType('all')
    setFromLocation('all')
    setToLocation('all')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const formatMovementType = (type: string) => {
    const typeMap: Record<string, string> = {
      transfer: t.transfer,
      sale: t.sale,
      adjustment: t.adjustment,
      initial_stock: t.initial_stock
    }
    return typeMap[type] || type
  }

  const formatLocation = (location: string | null) => {
    if (!location) return '—'
    const locationMap: Record<string, string> = {
      main_store: t.mainStore,
      retail_store: t.retailStore,
      sold: t.sold
    }
    return locationMap[location] || location
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (!mounted) {
    return null
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="teal" className="mx-auto mb-4" />
          <p className="text-gray-600">{language === 'sw' ? 'Inakagua uhakiki...' : 'Checking authentication...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t.filters}</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.filters}</span>
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.movementType}</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                >
                  <option value="all">{t.allTypes}</option>
                  <option value="transfer">{t.transfer}</option>
                  <option value="sale">{t.sale}</option>
                  <option value="adjustment">{t.adjustment}</option>
                  <option value="initial_stock">{t.initial_stock}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fromLocation}</label>
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                >
                  <option value="all">{t.allLocations}</option>
                  <option value="main_store">{t.mainStore}</option>
                  <option value="retail_store">{t.retailStore}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.toLocation}</label>
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                >
                  <option value="all">{t.allLocations}</option>
                  <option value="main_store">{t.mainStore}</option>
                  <option value="retail_store">{t.retailStore}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.startDate}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.endDate}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white text-sm"
                />
              </div>
            </motion.div>
          )}

          {(movementType !== 'all' || fromLocation !== 'all' || toLocation !== 'all' || startDate || endDate) && (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t.showing} {pagination.totalCount} {t.results}
              </span>
              <button
                onClick={clearFilters}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Movements Table */}
        {loading ? (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Spinner size="lg" color="teal" className="mx-auto mb-4" />
            <p className="text-gray-600">{t.loading}</p>
          </motion.div>
        ) : movements.length === 0 ? (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noMovements}</h3>
            <p className="text-gray-600">{t.noMovementsDescription}</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.product}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.movement}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.quantity}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.type}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.reason}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.user}</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.date}</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement, index) => (
                    <motion.tr
                      key={movement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {movement.product.images?.[0]?.url ? (
                              <Image src={movement.product.images[0].url} alt={movement.product.name} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <ArchiveBoxIcon className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{movement.product.name}</p>
                            {movement.product.sku && (
                              <p className="text-sm text-gray-500 font-mono">{movement.product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{formatLocation(movement.fromLocation || null)}</span>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">{formatLocation(movement.toLocation)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">{movement.quantity}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-700">
                          {formatMovementType(movement.movementType)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{movement.reason || '—'}</span>
                        {movement.referenceId && (
                          <p className="text-xs text-gray-500 font-mono">{movement.referenceId}</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">
                          {movement.user ? `${movement.user.firstName} ${movement.user.lastName}` : '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{formatDate(movement.createdAt)}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t.showing} {((pagination.currentPage - 1) * pagination.limit) + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} {t.of} {pagination.totalCount} {t.results}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>{t.previous}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          pagination.currentPage === page
                            ? 'bg-teal-500 text-white hover:bg-teal-600'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <span>{t.next}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
