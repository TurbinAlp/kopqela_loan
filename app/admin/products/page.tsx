'use client'

import { useState, useEffect } from 'react'
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
  FunnelIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../hooks/useRequireAuth'
import { useProductsData, ProductsCacheInvalidator } from '../../hooks/useProductsData'
import Link from 'next/link'
import Image from 'next/image'
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal'
import SuccessModal from '../../components/ui/SuccessModal'
import StockTransferModal from '../../components/ui/StockTransferModal'
import Spinner from '../../components/ui/Spinner'
import { useNotifications } from '../../contexts/NotificationContext'

// Use Product type from useProductsData hook

export default function ProductsPage() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()
  
  // 🚀 IMPROVED: Use caching hook with enhanced features
  const { 
    data: productsData, 
    isLoading, 
    lastFetched, 
    cacheStatus,
    refreshData
  } = useProductsData(currentBusiness?.id, !!currentBusiness)
  
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
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

  // Bulk delete modal state
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{
    isOpen: boolean
    productCount: number
  }>({
    isOpen: false,
    productCount: 0
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

  // Stock transfer modal state
  const [stockTransferModal, setStockTransferModal] = useState({
    isOpen: false
  })



  useEffect(() => {
    setMounted(true)
  }, [])

  // 🚀 IMPROVED: Process cached data with optimistic updates state
  const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<number[]>([])
  const products = (productsData?.products || []).filter(p => !optimisticDeletedIds.includes(p.id))
  const categories = productsData?.categories || []
  const loading = isLoading
  const loadingCategories = isLoading

  const translations = {
    en: {
      addProduct: "Add Product",
      searchProducts: "Search products...",
      filters: "Filters",
      exportData: "Export Data",
      bulkActions: "Bulk Actions",
      deleteSelected: "Delete Selected",
      transferStock: "Transfer Stock",
      
      // View modes
      gridView: "Grid View",
      listView: "List View",
      
      // Filters
      allCategories: "All Categories",
      allStatuses: "All Statuses",
      allLocations: "All Locations",
      categoryFilter: "Category",
      statusFilter: "Status",
      locationFilter: "Location",
      
      // Table headers
      product: "Product",
      sku: "SKU",
      category: "Category", 
      unit: "Unit",
      stock: "Stock",
      location: "Location",
      price: "Price",
      status: "Status",
      actions: "Actions",
      createdAt: "Created",
      
      // Actions
      view: "View",
      edit: "Edit", 
      delete: "Delete",
      selectAll: "Select All",
      
      // Status
      inStock: "In Stock",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      
      // Categories
      electronics: "Electronics",
      clothing: "Clothing",
      food: "Food & Beverages",
      home: "Home & Garden",
      beauty: "Beauty & Personal Care",
      sports: "Sports & Outdoors",
      
      // Locations
      mainStore: "Main Store",
      retailStore: "Retail Store",
      
      // Pagination
      showing: "Showing",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next",
      
      // Export options
      exportCSV: "Export CSV",
      exportExcel: "Export Excel",
      exportPDF: "Export PDF",
      
      currency: "TZS",
      
      // Delete modal
      deleteProduct: "Delete Product",
      deleteConfirmMessage: "Are you sure you want to delete this product? This will remove it from your inventory permanently.",
      
      // Success messages
      deleteSuccess: "Product Deleted Successfully",
      deleteSuccessMessage: "The product has been removed from your inventory.",
      
      // Error messages
      error: "Error",
      loadingProducts: "Loading Products",
      loadingMessage: "Please wait while we fetch your products..."
    },
    sw: {
      addProduct: "Ongeza Bidhaa",
      searchProducts: "Tafuta bidhaa...",
      filters: "Vichujio",
      exportData: "Hamisha Data",
      bulkActions: "Vitendo vya Pamoja",
      deleteSelected: "Futa Zilizochaguliwa",
      transferStock: "Hamisha Hisa",
      
      // View modes
      gridView: "Mchoro wa Grid",
      listView: "Mchoro wa Orodha",
      
      // Filters
      allCategories: "Makundi Yote",
      allStatuses: "Hali Zote",
      allLocations: "Mahali Yote",
      categoryFilter: "Kundi",
      statusFilter: "Hali",
      locationFilter: "Mahali",
      
      // Table headers
      product: "Bidhaa",
      sku: "SKU",
      category: "Kundi",
      unit: "Kipimo",
      stock: "Hisa",
      location: "Mahali",
      price: "Bei",
      status: "Hali",
      actions: "Vitendo",
      createdAt: "Ilipotengenezwa",
      
      // Actions
      view: "Angalia",
      edit: "Hariri",
      delete: "Futa",
      selectAll: "Chagua Zote",
      
      // Status
      inStock: "Ipo Hisani",
      lowStock: "Hisa Ndogo",
      outOfStock: "Hisa Imeisha",
      
      // Categories
      electronics: "Vifaa vya Umeme",
      clothing: "Nguo",
      food: "Chakula na Vinywaji", 
      home: "Nyumba na Bustani",
      beauty: "Urembo na Huduma za Kibinafsi",
      sports: "Michezo na Nje",
      
      // Locations
      mainStore: "Hifadhi Kuu",
      retailStore: "Duka la Nje",
      
      // Pagination
      showing: "Inaonyesha",
      of: "ya",
      results: "matokeo",
      previous: "Iliyotangulia",
      next: "Ifuatayo",
      
      // Export options
      exportCSV: "Hamisha CSV",
      exportExcel: "Hamisha Excel",
      exportPDF: "Hamisha PDF",
      
      currency: "TSh",
      
      // Delete modal
      deleteProduct: "Futa Bidhaa",
      deleteConfirmMessage: "Je, una uhakika unataka kufuta bidhaa hii? Hii itaiondoa kabisa kwenye hisa yako.",
      
      // Success messages
      deleteSuccess: "Bidhaa Imefutwa Kwa Ufanisi",
      deleteSuccessMessage: "Bidhaa imeondolewa kwenye hisa yako.",
      
      // Error messages
      error: "Hitilafu",
      loadingProducts: "Inapakia Bidhaa",
      loadingMessage: "Tafadhali subiri tunapokusanya bidhaa zako..."
    }
  }

  const t = translations[language]

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const name = product.name || ''
    const sku = product.sku || ''
    const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || '')
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory
    
    // Location filtering logic
    let matchesLocation = true
    if (selectedLocation !== 'all') {
      const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
      if (selectedLocation === 'main_store') {
        matchesLocation = inventoryArray.some(inv => inv.location === 'main_store' && inv.quantity > 0)
      } else if (selectedLocation === 'retail_store') {
        matchesLocation = inventoryArray.some(inv => inv.location === 'retail_store' && inv.quantity > 0)
      }
    }
    
    // Status logic: compute status based on combined inventory from both locations
    let status: string = 'inStock'
    if (product.isDraft) {
      status = 'draft'
    } else if (!product.isActive) {
      status = 'inactive'
    } else if (product.isActive) {
      status = 'active'
    }
    
    // Override with stock status based on combined inventory from both locations
    const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
    const mainStock = inventoryArray.find(inv => inv.location === 'main_store')?.quantity ?? 0
    const retailStock = inventoryArray.find(inv => inv.location === 'retail_store')?.quantity ?? 0
    const totalStock = mainStock + retailStock
    const combinedReorderPoint = Math.max(
      inventoryArray.find(inv => inv.location === 'main_store')?.reorderPoint ?? 0,
      inventoryArray.find(inv => inv.location === 'retail_store')?.reorderPoint ?? 0
    )
    
    if (totalStock === 0) {
      status = 'outOfStock'
    } else if (combinedReorderPoint > 0 && totalStock <= combinedReorderPoint) {
      status = 'lowStock'  
    } else if (totalStock > 0) {
      status = 'inStock'
    }
    
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inStock': return 'text-green-600 bg-green-100'
      case 'lowStock': return 'text-yellow-600 bg-yellow-100'
      case 'outOfStock': return 'text-red-600 bg-red-100'
      case 'notAvailableForSale': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(currentProducts.map(p => p.id))
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedProducts.length === 0) return
    
    setBulkDeleteModal({
      isOpen: true,
      productCount: selectedProducts.length
    })
  }

  const handleBulkDeleteConfirm = async () => {
    setBulkDeleting(true)
    
    try {
      // Delete products one by one
      const deletePromises = selectedProducts.map(productId => 
        fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(res => res.json())
      )
      
      const results = await Promise.all(deletePromises)
      
      // Check if all deletions were successful
      const successCount = results.filter(result => result.success).length
      const failedCount = results.length - successCount
      
      if (successCount > 0) {
        // Invalidate cache to trigger re-fetch
        ProductsCacheInvalidator.onProductChanged(currentBusiness?.id || 0)
        setSelectedProducts([])
        
        // Show success message
        const successMessage = language === 'sw'
          ? `Bidhaa ${successCount} zimefutwa kwa mafanikio${failedCount > 0 ? `. ${failedCount} hazikufuta.` : '.'}`
          : `${successCount} products deleted successfully${failedCount > 0 ? `. ${failedCount} failed to delete.` : '.'}`
        
        setSuccessModal({
          isOpen: true,
          title: language === 'sw' ? 'Bidhaa Zimefutwa' : 'Products Deleted',
          message: successMessage
        })
      }
      
      if (failedCount > 0 && successCount === 0) {
        // Show error if all failed
        const errorMessage = language === 'sw'
          ? 'Imeshindwa kufuta bidhaa. Jaribu tena.'
          : 'Failed to delete products. Please try again.'
        
        showError(t.error || 'Error', errorMessage)
      }
      
    } catch (error) {
      console.error('Error during bulk delete:', error)
      const errorMessage = language === 'sw'
        ? 'Hitilafu imetokea wakati wa kufuta bidhaa.'
        : 'An error occurred while deleting products.'
      
      showError(t.error || 'Error', errorMessage)
    } finally {
      setBulkDeleting(false)
      setBulkDeleteModal({ isOpen: false, productCount: 0 })
    }
  }

  const handleBulkDeleteClose = () => {
    setBulkDeleteModal({ isOpen: false, productCount: 0 })
  }

  const handleTransferClick = () => {
    if (selectedProducts.length === 0) {
      showError(
        language === 'sw' ? 'Hitilafu' : 'Error',
        language === 'sw' 
          ? 'Tafadhali chagua bidhaa za kuhamisha'
          : 'Please select products to transfer'
      )
      return
    }

    setStockTransferModal({ isOpen: true })
  }

  const handleTransferComplete = () => {
    // Refresh products data
    refreshData()
    // Clear selected products
    setSelectedProducts([])
  }

  const handleExport = (format: string) => {
    // Implement export logic
    console.log('Exporting data as:', format)
  }

  const handleDeleteClick = (productId: number, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    })
  }

  // 🚀 IMPROVED: Optimistic delete with rollback on failure
  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId || !currentBusiness) return
    
    const productId = deleteModal.productId
    
    // 1. Optimistic update - immediately hide the product
    setOptimisticDeletedIds(prev => [...prev, productId])
    setDeleteModal({ isOpen: false, productId: null, productName: '' })
    
    // 2. Show optimistic success notification
    showSuccess(
      t.deleteSuccess,
      t.deleteSuccessMessage
    )
    
    try {
      const response = await fetch(`/api/admin/products/${productId}?businessId=${currentBusiness.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // 3. Success - invalidate cache and remove from optimistic state
        ProductsCacheInvalidator.onProductChanged(currentBusiness.id)
        setOptimisticDeletedIds(prev => prev.filter(id => id !== productId))
      } else {
        console.error('Failed to delete product:', data.message || 'Unknown error')
        
        // 4. Failure - rollback optimistic update
        setOptimisticDeletedIds(prev => prev.filter(id => id !== productId))
        
        // Check if it's a foreign key constraint error that suggests deactivation
        if (data.canDeactivate && response.status === 400) {
          // Show custom error with deactivate option
          showError(
            language === 'sw' ? 'Haiwezi Kufutwa' : 'Cannot Delete',
            data.message || (language === 'sw' 
              ? 'Bidhaa hii haiwezi kufutwa kwa sababu imetumika kwenye mauzo. Unaweza kuifanya isiwe hai (inactive) badala yake.'
              : 'This product cannot be deleted because it has been used in sales. You can make it inactive instead.')
          )
        } else {
          const errorMessage = language === 'sw' 
            ? 'Imeshindwa kufuta bidhaa. Jaribu tena.'
            : 'Failed to delete product. Please try again.'
          showError(t.error || 'Error', data.message || errorMessage)
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      
      // 5. Network error - rollback optimistic update
      setOptimisticDeletedIds(prev => prev.filter(id => id !== productId))
      
      const errorMessage = language === 'sw'
        ? 'Hitilafu ya mtandao: Imeshindwa kufuta bidhaa'
        : 'Network error: Failed to delete product'
      showError(t.error || 'Error', errorMessage)
    }
  }

  const handleDeleteClose = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' })
  }



  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Show loading spinner while auth or initial data is loading
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
    <div>
      {/* Action Bar */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-end space-x-3">
          {/* 🚀 IMPROVED: Manual refresh button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Refresh data"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <Link
            href="/admin/products/add"
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </Link>
        </div>

        {/* Cache Status */}
        {lastFetched && (
          <div className="mt-2 text-right">
            <p className="text-xs text-gray-500">
              Last updated: {lastFetched.toLocaleTimeString()}
              <span className={`ml-2 ${
                cacheStatus === 'fresh' ? 'text-green-600' :
                cacheStatus === 'stale' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {cacheStatus === 'fresh' && '🟢 Fresh'}
                {cacheStatus === 'stale' && '🟡 Updating...'}
                {cacheStatus === 'empty' && '⚪ Loading...'}
              </span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* Mobile Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white text-sm"
              />
            </div>
          </div>

          {/* Mobile Horizontal Controls */}
          <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2 snap-x snap-mandatory" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
            {/* View Toggle - Mobile */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 flex-shrink-0 snap-start">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle - Mobile */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900 flex-shrink-0 snap-start"
            >
              <FunnelIcon className="w-4 h-4 text-gray-600" />
            </motion.button>

            {/* Export Dropdown - Mobile */}
            <div className="relative group flex-shrink-0 snap-start">
              <button className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium">
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Export</span>
                <ChevronDownIcon className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg text-gray-900 hover:text-gray-900 text-sm"
                >
                  {t.exportCSV}
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900 hover:text-gray-900 text-sm"
                >
                  {t.exportExcel}
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg text-gray-900 hover:text-gray-900 text-sm"
                >
                  {t.exportPDF}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Original Design */}
        <div className="hidden sm:block">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchProducts}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
                <span>{t.listView}</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                <span>{t.gridView}</span>
              </button>
            </div>

            {/* Filters Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <span>{t.filters}</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.categoryFilter}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                  disabled={loadingCategories}
                >
                  <option value="all">{t.allCategories}</option>
                  {Array.isArray(categories) && categories.map((category, index) => {
                    const categoryObj = typeof category === 'string' 
                      ? { id: category, name: category, nameSwahili: '' } 
                      : (category as { id: string | number, name: string, nameSwahili?: string })
                    return (
                      <option key={categoryObj.id || index} value={categoryObj.name}>
                        {language === 'sw' && categoryObj.nameSwahili ? categoryObj.nameSwahili : categoryObj.name}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.statusFilter}</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="inStock">{t.inStock}</option>
                  <option value="lowStock">{t.lowStock}</option>
                  <option value="outOfStock">{t.outOfStock}</option>
                  <option value="active">{language === 'sw' ? 'Inatumika' : 'Active'}</option>
                  <option value="inactive">{language === 'sw' ? 'Haitumiki' : 'Inactive'}</option>
                  <option value="draft">{language === 'sw' ? 'Dondoo' : 'Draft'}</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.locationFilter}</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                >
                  <option value="all">{t.allLocations}</option>
                  <option value="main_store">{t.mainStore}</option>
                  <option value="retail_store">{t.retailStore}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bulk Actions & Export */}
      {(selectedProducts.length > 0 || filteredProducts.length > 0) && (
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={bulkDeleting}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                  <span>
                    {bulkDeleting 
                      ? (language === 'sw' ? 'Inafuta...' : 'Deleting...') 
                      : t.deleteSelected
                    }
                  </span>
                </button>
                <button
                  onClick={handleTransferClick}
                  className="flex items-center space-x-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 hover:text-teal-800 transition-colors font-medium"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                  <span>{t.transferStock}</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Dropdown - Desktop Only */}
          <div className="hidden sm:block relative group">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>{t.exportData}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg text-gray-900 hover:text-gray-900"
              >
                {t.exportCSV}
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900 hover:text-gray-900"
              >
                {t.exportExcel}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg text-gray-900 hover:text-gray-900"
              >
                {t.exportPDF}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Display */}
      {loading ? (
        /* Skeleton Loader */
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="text-left py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-6">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        /* No Products Found */
        <motion.div 
          variants={itemVariants} 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedLocation !== 'all'
              ? (language === 'sw' ? 'Hakuna Bidhaa Zilizopatikana' : 'No Products Found')
              : (language === 'sw' ? 'Hakuna Bidhaa' : 'No Products Yet')
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedLocation !== 'all'
              ? (language === 'sw' 
                  ? 'Jaribu kubadilisha vichujio vyako au utafute kitu kingine.'
                  : 'Try adjusting your filters or search for something else.'
                )
              : (language === 'sw' 
                  ? 'Anza kwa kuongeza bidhaa ya kwanza.'
                  : 'Get started by adding your first product.'
                )
            }
          </p>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedLocation !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedStatus('all')
                setSelectedLocation('all')
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mr-3"
            >
              {language === 'sw' ? 'Ondoa Vichujio' : 'Clear Filters'}
            </button>
          )}
          <Link
            href="/admin/products/add"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {language === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}
          </Link>
        </motion.div>
      ) : viewMode === 'list' ? (
        /* List View */
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.product}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.sku}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.category}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.unit}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.stock}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.location}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.price}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.status}</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-800">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {(() => {
                            // Find primary image first
                            const primaryImage = product.images?.find(img => img.isPrimary);
                            const imageToShow = primaryImage || product.images?.[0];
                            
                            if (imageToShow) {
                              return <Image src={imageToShow.url} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />;
                            } else {
                              return <ArchiveBoxIcon className="w-6 h-6 text-gray-500" />;
                            }
                          })()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.createdAt.split('T')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-mono text-sm">{product.sku || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{typeof product.category === 'string' ? product.category : product.category?.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{product.unit || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        // Calculate stock breakdown by location
                        const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
                        const mainStock = inventoryArray.find(inv => inv.location === 'main_store')?.quantity ?? 0
                        const retailStock = inventoryArray.find(inv => inv.location === 'retail_store')?.quantity ?? 0
                        const totalStock = mainStock + retailStock

                        if (totalStock === 0) {
                          return <span className="text-gray-500">—</span>
                        }

                        return (
                          <div className="text-sm">
                            <div className="text-gray-800 font-medium">Total: {totalStock}</div>
                            <div className="text-gray-600">
                              Main: {mainStock} | Retail: {retailStock}
                            </div>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 text-sm">{product.inventory?.location || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800">{t.currency} {product.price}</span>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        // Calculate retail store availability for sale status
                        const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
                        const retailStock = inventoryArray.find(inv => inv.location === 'retail_store')?.quantity ?? 0
                        const mainStock = inventoryArray.find(inv => inv.location === 'main_store')?.quantity ?? 0
                        const totalStock = mainStock + retailStock

                        let status: string = 'inStock'
                        let statusText = t.inStock

                        if (retailStock === 0) {
                          if (totalStock === 0) {
                            status = 'outOfStock'
                            statusText = t.outOfStock
                          } else {
                            status = 'notAvailableForSale'
                            statusText = language === 'sw' ? 'Haipatikani Kwa Mauzo' : 'Not Available for Sale'
                          }
                        } else if (retailStock < 10) {
                          status = 'lowStock'
                          statusText = t.lowStock
                        }

                        return (
                          <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(status)}`}>
                            {statusText}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t.view}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </motion.button>
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t.edit}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(product.id, product.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t.delete}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Grid View */
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                {(() => {
                  // Calculate retail store availability for sale status
                  const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
                  const retailStock = inventoryArray.find(inv => inv.location === 'retail_store')?.quantity ?? 0
                  const mainStock = inventoryArray.find(inv => inv.location === 'main_store')?.quantity ?? 0
                  const totalStock = mainStock + retailStock

                  let status: string = 'inStock'
                  let statusText = t.inStock

                  if (retailStock === 0) {
                    if (totalStock === 0) {
                      status = 'outOfStock'
                      statusText = t.outOfStock
                    } else {
                      status = 'notAvailableForSale'
                      statusText = language === 'sw' ? 'Haipatikani Kwa Mauzo' : 'Not Available for Sale'
                    }
                  } else if (retailStock < 10) {
                    status = 'lowStock'
                    statusText = t.lowStock
                  }

                  return (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status)}`}>
                      {statusText}
                    </span>
                  )
                })()}
              </div>

              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {(() => {
                  // Find primary image first
                  const primaryImage = product.images?.find(img => img.isPrimary);
                  const imageToShow = primaryImage || product.images?.[0];
                  
                  if (imageToShow) {
                    return <Image src={imageToShow.url} alt={product.name} width={200} height={128} className="w-full h-full object-cover" />;
                  } else {
                    return <ArchiveBoxIcon className="w-12 h-12 text-gray-500" />;
                  }
                })()}
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{product.sku || 'No SKU'}</p>
                <p className="text-sm text-gray-600">{typeof product.category === 'string' ? product.category : product.category?.name}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>{t.unit}: {product.unit || '—'}</span>
                  </div>
                  {(() => {
                    // Calculate stock breakdown by location
                    const inventoryArray = Array.isArray(product.inventory) ? product.inventory : (product.inventory ? [product.inventory] : [])
                    const mainStock = inventoryArray.find(inv => inv.location === 'main_store')?.quantity ?? 0
                    const retailStock = inventoryArray.find(inv => inv.location === 'retail_store')?.quantity ?? 0
                    const totalStock = mainStock + retailStock

                    if (totalStock === 0) {
                      return <div className="text-gray-500">{t.stock}: —</div>
                    }

                    return (
                      <div>
                        <div className="font-medium text-gray-800">Total: {totalStock}</div>
                        <div className="text-xs text-gray-500">
                          Main: {mainStock} | Retail: {retailStock}
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.location}: {product.inventory?.location || '—'}</span>
                  <span className="font-semibold text-gray-800">{t.currency} {product.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link href={`/admin/products/${product.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.view}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href={`/admin/products/${product.id}/edit`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title={t.edit}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteClick(product.id, product.name)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.delete}
                >
                  <TrashIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="mt-8">
          {/* Mobile Pagination */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-600">
                {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} {language === 'sw' ? 'ya' : 'of'} {filteredProducts.length}
              </div>
              <div className="text-xs text-gray-600">
                {language === 'sw' ? 'Uk.' : 'Page'} {currentPage}/{totalPages}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide max-w-48">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg font-medium transition-colors text-sm ${
                        currentPage === page
                          ? 'bg-teal-500 text-white hover:bg-teal-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              {t.showing} {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} {t.of} {filteredProducts.length} {t.results}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>{t.previous}</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 hover:text-gray-900"
              >
                <span>{t.next}</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title={t.deleteProduct}
        message={t.deleteConfirmMessage}
        itemName={deleteModal.productName}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={bulkDeleteModal.isOpen}
        onClose={handleBulkDeleteClose}
        onConfirm={handleBulkDeleteConfirm}
        title={language === 'sw' ? 'Futa Bidhaa Zilizochaguliwa' : 'Delete Selected Products'}
        message={language === 'sw' 
          ? `Je, una uhakika unataka kufuta bidhaa ${bulkDeleteModal.productCount}? Hatua hii haiwezi kubatilishwa.`
          : `Are you sure you want to delete ${bulkDeleteModal.productCount} products? This action cannot be undone.`
        }
        itemName=""
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={stockTransferModal.isOpen}
        onClose={() => setStockTransferModal({ isOpen: false })}
        products={products}
        selectedProductIds={selectedProducts}
        onTransferComplete={handleTransferComplete}
      />
    </div>
  )
}