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
import Link from 'next/link'

interface Product {
  id: number
  name: string
  category: string
  stock: number
  price: number
  status: 'inStock' | 'lowStock' | 'outOfStock'
  image: string
  sku: string
  createdAt: string
}

export default function ProductsPage() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
      stock: "Stock",
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
      
      currency: "TZS"
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
      stock: "Hisa",
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
      
      currency: "TSh"
    }
  }

  const t = translations[language]

  // Sample products data (expanded)
  const allProducts: Product[] = [
    {
      id: 1,
      name: "Samsung Galaxy A54",
      category: t.electronics,
      stock: 45,
      price: 850000,
      status: "inStock",
      image: "/api/placeholder/60/60",
      sku: "SMG-A54-001",
      createdAt: "2024-01-10"
    },
    {
      id: 2,
      name: "Cotton T-Shirt",
      category: t.clothing,
      stock: 8,
      price: 25000,
      status: "lowStock",
      image: "/api/placeholder/60/60",
      sku: "CTT-001",
      createdAt: "2024-01-12"
    },
    {
      id: 3,
      name: "Instant Coffee",
      category: t.food,
      stock: 0,
      price: 8500,
      status: "outOfStock",
      image: "/api/placeholder/60/60",
      sku: "ICF-001",
      createdAt: "2024-01-08"
    },
    {
      id: 4,
      name: "Garden Hose",
      category: t.home,
      stock: 23,
      price: 45000,
      status: "inStock",
      image: "/api/placeholder/60/60",
      sku: "GDH-001",
      createdAt: "2024-01-15"
    },
    {
      id: 5,
      name: "Face Cream",
      category: t.beauty,
      stock: 12,
      price: 35000,
      status: "inStock",
      image: "/api/placeholder/60/60",
      sku: "FCR-001",
      createdAt: "2024-01-14"
    },
    {
      id: 6,
      name: "Running Shoes",
      category: t.sports,
      stock: 5,
      price: 120000,
      status: "lowStock",
      image: "/api/placeholder/60/60",
      sku: "RNS-001",
      createdAt: "2024-01-11"
    },
    {
      id: 7,
      name: "iPhone 15",
      category: t.electronics,
      stock: 15,
      price: 1500000,
      status: "inStock",
      image: "/api/placeholder/60/60",
      sku: "IPH-15-001",
      createdAt: "2024-01-13"
    },
    {
      id: 8,
      name: "Jeans Trouser",
      category: t.clothing,
      stock: 20,
      price: 55000,
      status: "inStock",
      image: "/api/placeholder/60/60",
      sku: "JNS-001",
      createdAt: "2024-01-09"
    }
  ]

  const categories = [
    { value: 'all', label: t.allCategories },
    { value: t.electronics, label: t.electronics },
    { value: t.clothing, label: t.clothing },
    { value: t.food, label: t.food },
    { value: t.home, label: t.home },
    { value: t.beauty, label: t.beauty },
    { value: t.sports, label: t.sports }
  ]

  const statuses = [
    { value: 'all', label: t.allStatuses },
    { value: 'inStock', label: t.inStock },
    { value: 'lowStock', label: t.lowStock },
    { value: 'outOfStock', label: t.outOfStock }
  ]

  // Filter products based on search and filters
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
    
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

  const handleBulkDelete = () => {
    // Implement bulk delete logic
    console.log('Deleting products:', selectedProducts)
    setSelectedProducts([])
  }

  const handleExport = (format: string) => {
    // Implement export logic
    console.log('Exporting data as:', format)
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
    >
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
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value} className="text-gray-900">
                      {category.label}
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
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value} className="text-gray-900">
                      {status.label}
                    </option>
                  ))}
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
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 transition-colors font-medium"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{t.deleteSelected}</span>
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
      {viewMode === 'list' ? (
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.stock}</th>
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
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ArchiveBoxIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.createdAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-mono text-sm">{product.sku}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{product.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{product.stock}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800">{t.currency} {product.price.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(product.status)}`}>
                        {t[product.status as keyof typeof t]}
                      </span>
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
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(product.status)}`}>
                  {t[product.status as keyof typeof t]}
                </span>
              </div>

              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <ArchiveBoxIcon className="w-12 h-12 text-gray-500" />
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                <p className="text-sm text-gray-600">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stock}: {product.stock}</span>
                  <span className="font-semibold text-gray-800">{t.currency} {product.price.toLocaleString()}</span>
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
    </motion.div>
  )
}