'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  TagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  description: string
  descriptionSwahili?: string
  category: string
  stock: number
  price: number
  costPrice: number
  status: 'inStock' | 'lowStock' | 'outOfStock'
  image: string
  sku: string
  barcode?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  supplier?: string
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  createdAt: string
  updatedAt: string
  tags: string[]
  isActive: boolean
}

// Mock data - replace with actual API call
const mockProduct: Product = {
  id: 1,
  name: 'Laptop Dell Inspiron 15',
  nameSwahili: 'Kompyuta Dell Inspiron 15',
  description: 'High-performance laptop with Intel Core i7 processor, 16GB RAM, and 512GB SSD. Perfect for business and professional use.',
  descriptionSwahili: 'Kompyuta ya utendaji wa juu na kichakataji cha Intel Core i7, RAM ya 16GB, na SSD ya 512GB. Inafaa kwa biashara na matumizi ya kitaalamu.',
  category: 'Electronics',
  stock: 15,
  price: 850000,
  costPrice: 720000,
  status: 'inStock',
  image: '/images/laptop-dell.jpg',
  sku: 'DELL-INS-15-001',
  barcode: '1234567890123',
  weight: 2.1,
  dimensions: {
    length: 35.8,
    width: 23.6,
    height: 1.8
  },
  supplier: 'Dell Technologies',
  minStockLevel: 5,
  maxStockLevel: 50,
  reorderPoint: 10,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  tags: ['laptop', 'computer', 'dell', 'business'],
  isActive: true
}

export default function ProductViewPage() {
  const { language } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    // Simulate API call
    const fetchProduct = async () => {
      setIsLoading(true)
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProduct(mockProduct)
      setIsLoading(false)
    }

    fetchProduct()
  }, [params.id])

  const translations = {
    en: {
      backToProducts: 'Back to Products',
      productDetails: 'Product Details',
      editProduct: 'Edit Product',
      deleteProduct: 'Delete Product',
      productInfo: 'Product Information',
      inventory: 'Inventory',
      pricing: 'Pricing',
      specifications: 'Specifications',
      activity: 'Activity',
      
      // Fields
      name: 'Product Name',
      description: 'Description',
      category: 'Category',
      sku: 'SKU',
      barcode: 'Barcode',
      status: 'Status',
      stock: 'Current Stock',
      price: 'Selling Price',
      costPrice: 'Cost Price',
      profit: 'Profit Margin',
      weight: 'Weight',
      dimensions: 'Dimensions',
      supplier: 'Supplier',
      minStock: 'Minimum Stock',
      maxStock: 'Maximum Stock',
      reorderPoint: 'Reorder Point',
      tags: 'Tags',
      createdAt: 'Created',
      updatedAt: 'Last Updated',
      
      // Status
      inStock: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      active: 'Active',
      inactive: 'Inactive',
      
      // Units
      kg: 'kg',
      cm: 'cm',
      currency: 'TSh',
      
      // Actions
      confirmDelete: 'Are you sure you want to delete this product?',
      deleteWarning: 'This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete',
      loading: 'Loading...'
    },
    sw: {
      backToProducts: 'Rudi kwenye Bidhaa',
      productDetails: 'Maelezo ya Bidhaa',
      editProduct: 'Hariri Bidhaa',
      deleteProduct: 'Futa Bidhaa',
      productInfo: 'Taarifa za Bidhaa',
      inventory: 'Hesabu',
      pricing: 'Bei',
      specifications: 'Vipimo',
      activity: 'Shughuli',
      
      // Fields
      name: 'Jina la Bidhaa',
      description: 'Maelezo',
      category: 'Jamii',
      sku: 'SKU',
      barcode: 'Barcode',
      status: 'Hali',
      stock: 'Stock ya Sasa',
      price: 'Bei ya Kuuza',
      costPrice: 'Bei ya Gharama',
      profit: 'Faida',
      weight: 'Uzito',
      dimensions: 'Vipimo',
      supplier: 'Msambazaji',
      minStock: 'Stock ya Chini',
      maxStock: 'Stock ya Juu',
      reorderPoint: 'Nukta ya Kuagiza',
      tags: 'Lebo',
      createdAt: 'Ilitengenezwa',
      updatedAt: 'Ilirekebishwa',
      
      // Status
      inStock: 'Ipo Stock',
      lowStock: 'Stock Kidogo',
      outOfStock: 'Hakuna Stock',
      active: 'Inatumika',
      inactive: 'Haitumiki',
      
      // Units
      kg: 'kg',
      cm: 'cm',
      currency: 'TSh',
      
      // Actions
      confirmDelete: 'Una uhakika unataka kufuta bidhaa hii?',
      deleteWarning: 'Kitendo hiki hakiwezi kubatilishwa.',
      cancel: 'Ghairi',
      delete: 'Futa',
      loading: 'Inapakia...'
    }
  }

  const t = translations[language as keyof typeof translations] || translations.en

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inStock':
        return 'bg-green-100 text-green-800'
      case 'lowStock':
        return 'bg-yellow-100 text-yellow-800'
      case 'outOfStock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateProfitMargin = (price: number, cost: number) => {
    return ((price - cost) / price * 100).toFixed(1)
  }

  const handleDelete = async () => {
    // Implement delete logic here
    console.log('Deleting product:', product?.id)
    setShowDeleteModal(false)
    router.push('/admin/products')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Product not found</p>
          <Link href="/admin/products" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
            {t.backToProducts}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>{t.backToProducts}</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{t.editProduct}</span>
              </Link>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                <span>{t.deleteProduct}</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}
            </h1>
            <p className="text-gray-600 mt-2">{t.productDetails}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TagIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t.productInfo}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <p className="text-gray-900">{language === 'sw' && product.nameSwahili ? product.nameSwahili : product.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                  <p className="text-gray-900">{product.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sku}</label>
                  <p className="text-gray-900 font-mono">{product.sku}</p>
                </div>
                
                {product.barcode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.barcode}</label>
                    <p className="text-gray-900 font-mono">{product.barcode}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.status}</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                    {t[product.status as keyof typeof t]}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.supplier}</label>
                  <p className="text-gray-900">{product.supplier || '-'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <p className="text-gray-900 leading-relaxed">
                  {language === 'sw' && product.descriptionSwahili ? product.descriptionSwahili : product.description}
                </p>
              </div>
              
              {product.tags.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.tags}</label>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t.specifications}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.weight}</label>
                    <p className="text-gray-900">{product.weight} {t.kg}</p>
                  </div>
                )}
                
                {product.dimensions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.dimensions}</label>
                    <p className="text-gray-900">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {t.cm}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <ArchiveBoxIcon className="h-16 w-16 text-gray-400" />
              </div>
            </motion.div>

            {/* Inventory */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t.inventory}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.stock}</span>
                  <span className="font-semibold text-gray-900">{product.stock}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.minStock}</span>
                  <span className="text-gray-900">{product.minStockLevel}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.maxStock}</span>
                  <span className="text-gray-900">{product.maxStockLevel}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.reorderPoint}</span>
                  <span className="text-gray-900">{product.reorderPoint}</span>
                </div>
                
                {product.stock <= product.reorderPoint && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Low stock alert</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t.pricing}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.costPrice}</span>
                  <span className="text-gray-900">{t.currency} {product.costPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.price}</span>
                  <span className="font-semibold text-gray-900">{t.currency} {product.price.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.profit}</span>
                  <span className="text-green-600 font-semibold">{calculateProfitMargin(product.price, product.costPrice)}%</span>
                </div>
              </div>
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t.activity}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">{t.createdAt}</span>
                  <p className="text-gray-900 text-sm">{formatDate(product.createdAt)}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">{t.updatedAt}</span>
                  <p className="text-gray-900 text-sm">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t.deleteProduct}</h3>
            </div>
            
            <p className="text-gray-600 mb-2">{t.confirmDelete}</p>
            <p className="text-sm text-gray-500 mb-6">{t.deleteWarning}</p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}