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
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useBusiness } from '../../contexts/BusinessContext'
import { useRequireAdminAuth } from '../../hooks/useRequireAuth'
import Link from 'next/link'
import Image from 'next/image'
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal'
import SuccessModal from '../../components/ui/SuccessModal'
import Spinner from '../../components/ui/Spinner'
import { useNotifications } from '../../contexts/NotificationContext'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  category: { id: number; name: string; nameSwahili?: string } | string
  price: number
  wholesalePrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  unit?: string
  images?: Array<{
    id: number
    url: string
    filename: string
    originalName: string
    size: number
    mimeType: string
    isPrimary: boolean
    sortOrder: number
  }>
  isActive: boolean
  isDraft: boolean
  inventory?: {
    quantity: number;
    reservedQuantity?: number;
    reorderPoint?: number;
    maxStock?: number;
    location?: string;
  }
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const { language } = useLanguage()
  const { showError } = useNotifications()
  const { isLoading: authLoading } = useRequireAdminAuth()
  const { currentBusiness } = useBusiness()
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [itemsPerPage] = useState(10)

  // NEW: State for products and loading
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{id: number; name: string; nameSwahili?: string}>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
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



  useEffect(() => {
    setMounted(true)
  }, [])

  // NEW: Fetch products from API - only after component mounts
  useEffect(() => {
    if (!mounted || !currentBusiness) return
    
    setLoading(true)
    
    fetch(`/api/admin/products?businessId=${currentBusiness.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data.products)
        } else {
          const errorMessage = data.message || 'Failed to fetch products'
          showError('Error', errorMessage)
        }
      })
      .catch(err => {
        const errorMessage = err.message || 'Failed to fetch products'
        showError('Error', errorMessage)
      })
      .finally(() => setLoading(false))
  }, [mounted, currentBusiness, showError])

  // Fetch categories
  useEffect(() => {
    if (!mounted || !currentBusiness) return
    
    setLoadingCategories(true)
    
    fetch(`/api/admin/categories?businessId=${currentBusiness.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Handle different API response structures
          const categoriesData = data.data?.categories || data.data || []
          setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        } else {
          console.error('Failed to fetch categories:', data.message)
          setCategories([])
        }
      })
      .catch(err => {
        console.error('Error fetching categories:', err)
        setCategories([])
      })
      .finally(() => setLoadingCategories(false))
  }, [mounted, currentBusiness])

  const translations = {
    en: {
      pageTitle: "Products Management",
      pageSubtitle: "Manage your inventory and product catalog",
      addProduct: "Add Product",
      searchProducts: "Search products...",
      filters: "Filters",
      exportData: "Export Data",
      bulkActions: "Bulk Actions",
      deleteSelected: "Delete Selected",
      
      // View modes
      gridView: "Grid View",
      listView: "List View",
      
      // Filters
      allCategories: "All Categories",
      allStatuses: "All Statuses",
      categoryFilter: "Category",
      statusFilter: "Status",
      
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
      pageTitle: "Usimamizi wa Bidhaa",
      pageSubtitle: "Simamia hisa na katalogi ya bidhaa zako",
      addProduct: "Ongeza Bidhaa",
      searchProducts: "Tafuta bidhaa...",
      filters: "Vichujio",
      exportData: "Hamisha Data",
      bulkActions: "Vitendo vya Pamoja",
      deleteSelected: "Futa Zilizochaguliwa",
      
      // View modes
      gridView: "Mchoro wa Grid",
      listView: "Mchoro wa Orodha",
      
      // Filters
      allCategories: "Makundi Yote",
      allStatuses: "Hali Zote",
      categoryFilter: "Kundi",
      statusFilter: "Hali",
      
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
    
    // Status logic: compute status based on inventory/stock and product state
    let status: string = 'inStock'
    if (product.isDraft) {
      status = 'draft'
    } else if (!product.isActive) {
      status = 'inactive'
    } else if (product.isActive) {
      status = 'active'
    }
    
    // Override with stock status if inventory exists
    if (product.inventory) {
      if (product.inventory.quantity === 0) status = 'outOfStock'
      else if (product.inventory.reorderPoint && product.inventory.quantity <= product.inventory.reorderPoint) status = 'lowStock'
      else if (product.inventory.quantity > 0) status = 'inStock'
    }
    
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
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
        // Remove deleted products from local state
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)))
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

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return
    
    try {
      const response = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Remove product from local state
        setProducts(prev => prev.filter(p => p.id !== deleteModal.productId))
        setDeleteModal({ isOpen: false, productId: null, productName: '' })
        
        // Show success modal
        setSuccessModal({
          isOpen: true,
          title: t.deleteSuccess,
          message: t.deleteSuccessMessage
        })
      } else {
        console.error('Failed to delete product:', data.message || 'Unknown error')
        const errorMessage = language === 'sw' 
          ? 'Imeshindwa kufuta bidhaa. Jaribu tena.'
          : 'Failed to delete product. Please try again.'
        showError(t.error || 'Error', data.message || errorMessage)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
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
      // Show loading spinner
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="teal" className="mx-auto mb-4" />
          <p className="text-gray-600">{t.loadingMessage}</p>
        </div>
      </div>
    )
  }
  }

  return (
    <div>
      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.pageTitle}</h2>
            <p className="text-gray-600">{t.pageSubtitle}</p>
          </div>
          <Link
            href="/admin/products/add"
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t.addProduct}</span>
          </Link>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
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

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {language === 'sw' && category.nameSwahili ? category.nameSwahili : category.name}
                    </option>
                  ))}
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
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative group">
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
      {filteredProducts.length === 0 ? (
        /* No Products Found */
        <motion.div 
          variants={itemVariants} 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
              ? (language === 'sw' ? 'Hakuna Bidhaa Zilizopatikana' : 'No Products Found')
              : (language === 'sw' ? 'Hakuna Bidhaa' : 'No Products Yet')
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
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
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedStatus('all')
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
                      <span className="text-gray-700">{product.inventory?.quantity ?? '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 text-sm">{product.inventory?.location || '—'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800">{t.currency} {product.price}</span>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        let status: string = 'inStock';
                        if (product.inventory && product.inventory.quantity === 0) status = 'outOfStock';
                        else if (product.inventory && product.inventory.quantity < 10) status = 'lowStock';
                        return (
                          <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(status)}`}>
                            {t[status as keyof typeof t]}
                          </span>
                        );
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
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor((() => {
                  let status: string = 'inStock';
                  if (product.inventory && product.inventory.quantity === 0) status = 'outOfStock';
                  else if (product.inventory && product.inventory.quantity < 10) status = 'lowStock';
                  return status;
                })())}`}>
                  {t[((() => {
                    let status: string = 'inStock';
                    if (product.inventory && product.inventory.quantity === 0) status = 'outOfStock';
                    else if (product.inventory && product.inventory.quantity < 10) status = 'lowStock';
                    return status;
                  })()) as keyof typeof t]}
                </span>
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
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{t.unit}: {product.unit || '—'}</span>
                  <span>{t.stock}: {product.inventory?.quantity ?? '—'}</span>
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
        <motion.div variants={itemVariants} className="mt-8 flex items-center justify-between">
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
    </div>
  )
}