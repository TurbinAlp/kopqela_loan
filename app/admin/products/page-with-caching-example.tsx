'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../hooks/useRequireAuth'
import { useProductsData, ProductsCacheInvalidator } from '../../hooks/useProductsData'
import Link from 'next/link'
import Image from 'next/image'
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal'
import SuccessModal from '../../components/ui/SuccessModal'
import Spinner from '../../components/ui/Spinner'
import { useNotifications } from '../../contexts/NotificationContext'

export default function ProductsPageWithCaching() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()
  
  // 🚀 NEW: Use caching hook instead of manual fetch
  const { 
    data: productsData, 
    isLoading, 
    lastFetched, 
    refreshData,
    cacheStatus 
  } = useProductsData(currentBusiness?.id, !!currentBusiness)

  // UI State
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [itemsPerPage] = useState(10)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    productId: number | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  })

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // 🚀 Processed data with caching
  const { products, categories, filteredProducts, paginatedProducts } = useMemo(() => {
    if (!productsData) {
      return {
        products: [],
        categories: [],
        filteredProducts: [],
        paginatedProducts: []
      }
    }

    const { products, categories } = productsData

    // Filter products based on search and filters
    let filtered = products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || 
        (typeof product.category === 'object' && product.category?.name === selectedCategory) ||
        (typeof product.category === 'string' && product.category === selectedCategory)
      
      const matchesStatus = selectedStatus === 'all' ||
        (selectedStatus === 'active' && product.isActive) ||
        (selectedStatus === 'inactive' && !product.isActive) ||
        (selectedStatus === 'draft' && product.isDraft)

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)

    return {
      products,
      categories,
      filteredProducts: filtered,
      paginatedProducts: paginated
    }
  }, [productsData, searchQuery, selectedCategory, selectedStatus, currentPage, itemsPerPage])

  // 🚀 Handle product deletion with cache invalidation
  const handleDeleteProduct = async (productId: number) => {
    if (!currentBusiness) return

    try {
      const response = await fetch(`/api/admin/products/${productId}?businessId=${currentBusiness.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // 🚀 Invalidate cache after successful deletion
        ProductsCacheInvalidator.onProductChanged(currentBusiness.id)
        
        showSuccess('Success', 'Product deleted successfully')
        setDeleteModal({ isOpen: false, productId: null, productName: '' })
      } else {
        showError('Error', result.message || 'Failed to delete product')
      }
    } catch (error) {
      showError('Error', 'Failed to delete product')
    }
  }

  // 🚀 Handle bulk deletion with cache invalidation
  const handleBulkDelete = async () => {
    if (!currentBusiness || selectedProducts.length === 0) return

    setBulkDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          businessId: currentBusiness.id
        })
      })

      const result = await response.json()

      if (result.success) {
        // 🚀 Invalidate cache after successful bulk deletion
        ProductsCacheInvalidator.onProductChanged(currentBusiness.id)
        
        showSuccess('Success', `${selectedProducts.length} products deleted successfully`)
        setSelectedProducts([])
      } else {
        showError('Error', result.message || 'Failed to delete products')
      }
    } catch (error) {
      showError('Error', 'Failed to delete products')
    } finally {
      setBulkDeleting(false)
    }
  }

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const translations = {
    en: {
      pageTitle: "Products",
      addProduct: "Add Product",
      searchPlaceholder: "Search products...",
      allCategories: "All Categories",
      allStatuses: "All Statuses",
      active: "Active",
      inactive: "Inactive",
      draft: "Draft",
      gridView: "Grid View",
      listView: "List View",
      filters: "Filters",
      export: "Export",
      selectAll: "Select All",
      deleteSelected: "Delete Selected",
      noProducts: "No products found",
      cacheStatus: "Cache Status",
      lastUpdated: "Last Updated",
      refresh: "Refresh"
    },
    sw: {
      pageTitle: "Bidhaa",
      addProduct: "Ongeza Bidhaa",
      searchPlaceholder: "Tafuta bidhaa...",
      allCategories: "Makundi Yote",
      allStatuses: "Hali Zote",
      active: "Imefungua",
      inactive: "Imefungwa",
      draft: "Rasimu",
      gridView: "Mchoro wa Grid",
      listView: "Mchoro wa Orodha",
      filters: "Vichujio",
      export: "Hamisha",
      selectAll: "Chagua Zote",
      deleteSelected: "Futa Zilizochaguliwa",
      noProducts: "Hakuna bidhaa zilizopatikana",
      cacheStatus: "Hali ya Cache",
      lastUpdated: "Ilisasishwa Mwisho",
      refresh: "Onyesha Upya"
    }
  }

  const t = translations[language as keyof typeof translations]

  return (
    <div className="space-y-6">
      {/* Header with cache status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
          {lastFetched && (
            <p className="text-xs text-gray-500 mt-1">
              {t.lastUpdated}: {lastFetched.toLocaleTimeString()}
              <span className={`ml-2 ${
                cacheStatus === 'fresh' ? 'text-green-600' :
                cacheStatus === 'stale' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {cacheStatus === 'fresh' && '🟢 Fresh'}
                {cacheStatus === 'stale' && '🟡 Stale'}
                {cacheStatus === 'empty' && '⚪ No cache'}
              </span>
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Manual refresh for dev/testing */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {t.refresh}
            </button>
          )}
          
          <Link
            href="/admin/products/add"
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center space-x-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
              <option value="draft">{t.draft}</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Stats */}
      {productsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{productsData.totalCount}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{productsData.categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{productsData.lowStockCount}</div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{filteredProducts.length}</div>
            <div className="text-sm text-gray-600">Filtered Results</div>
          </div>
        </div>
      )}

      {/* Products List/Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noProducts}</h3>
            <p className="text-gray-600">Start by adding your first product.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Products rendering logic here - same as original */}
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Stock: {product.inventory?.quantity || 0} | 
                        Price: TSh {product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          productId: product.id,
                          productName: product.name
                        })}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
        onConfirm={() => deleteModal.productId && handleDeleteProduct(deleteModal.productId)}
        itemName={deleteModal.productName}
        itemType="product"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  )
}
