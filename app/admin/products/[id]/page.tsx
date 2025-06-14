'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  descriptionSwahili?: string
  category: { id: number; name: string; nameSwahili?: string } | null
  price: number
  wholesalePrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  unit?: string
  imageUrl?: string
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
  inventory?: Array<{
    quantity: number
    reservedQuantity?: number
    reorderPoint?: number
    maxStock?: number
    location?: string
  }>
  createdAt: string
  updatedAt: string
}

export default function ProductViewPage() {
  const { language } = useLanguage()
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/products/${params.id}`)
        const data = await response.json()
        
        if (data.success) {
          setProduct(data.data)
        } else {
          setError(data.message || 'Failed to fetch product')
        }
      } catch {
        setError('Failed to fetch product')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
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
      
      // Fields
      name: 'Product Name',
      description: 'Description',
      category: 'Category',
      sku: 'SKU',
      barcode: 'Barcode',
      unit: 'Unit',
      currentStock: 'Current Stock',
      reservedStock: 'Reserved Stock',
      maxStock: 'Maximum Stock',
      reorderPoint: 'Reorder Point',
      location: 'Storage Location',
      sellingPrice: 'Selling Price',
      wholesalePrice: 'Wholesale Price',
      costPrice: 'Cost Price',
      profitMargin: 'Profit Margin',
      status: 'Status',
      createdAt: 'Created',
      updatedAt: 'Last Updated',
      
      // Status
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      published: 'Published',
      
      // Units
      currency: 'TZS',
      loading: 'Loading...',
      notFound: 'Product not found',
      noData: 'No data available'
    },
    sw: {
      backToProducts: 'Rudi kwenye Bidhaa',
      productDetails: 'Maelezo ya Bidhaa',
      editProduct: 'Hariri Bidhaa',
      deleteProduct: 'Futa Bidhaa',
      productInfo: 'Taarifa za Bidhaa',
      inventory: 'Hisa',
      pricing: 'Bei',
      
      // Fields
      name: 'Jina la Bidhaa',
      description: 'Maelezo',
      category: 'Kundi',
      sku: 'SKU',
      barcode: 'Barcode',
      unit: 'Kipimo',
      currentStock: 'Hisa ya Sasa',
      reservedStock: 'Hisa Iliyohifadhiwa',
      maxStock: 'Hisa ya Juu',
      reorderPoint: 'Nukta ya Kuagiza',
      location: 'Mahali pa Uhifadhi',
      sellingPrice: 'Bei ya Kuuza',
      wholesalePrice: 'Bei ya Jumla',
      costPrice: 'Bei ya Gharama',
      profitMargin: 'Faida',
      status: 'Hali',
      createdAt: 'Ilipotengenezwa',
      updatedAt: 'Ilirekebishwa',
      
      // Status
      active: 'Inatumika',
      inactive: 'Haitumiki',
      draft: 'Dondoo',
      published: 'Imechapishwa',
      
      // Units
      currency: 'TSh',
      loading: 'Inapakia...',
      notFound: 'Bidhaa haikupatikana',
      noData: 'Hakuna data'
    }
  }

  const t = translations[language]

  const calculateProfitMargin = (selling: number, cost?: number) => {
    if (!cost || cost === 0) return 0
    return ((selling - cost) / cost * 100).toFixed(1)
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || t.notFound}</p>
          <Link href="/admin/products" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
            {t.backToProducts}
          </Link>
        </div>
      </div>
    )
  }

  const inventory = product.inventory?.[0]

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
                  <p className="text-gray-900">{product.category?.name || t.noData}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sku}</label>
                  <p className="text-gray-900 font-mono">{product.sku || t.noData}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.barcode}</label>
                  <p className="text-gray-900 font-mono">{product.barcode || t.noData}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.unit}</label>
                  <p className="text-gray-900">{product.unit || t.noData}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.status}</label>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                      {product.isActive ? t.active : t.inactive}
                    </span>
                    {product.isDraft && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-100">
                        {t.draft}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {product.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                  <p className="text-gray-900 leading-relaxed">
                    {language === 'sw' && product.descriptionSwahili ? product.descriptionSwahili : product.description}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t.pricing}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.sellingPrice}</label>
                  <p className="text-2xl font-bold text-gray-900">{t.currency} {product.price?.toLocaleString()}</p>
                </div>
                
                {product.wholesalePrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.wholesalePrice}</label>
                    <p className="text-xl font-semibold text-gray-700">{t.currency} {product.wholesalePrice.toLocaleString()}</p>
                  </div>
                )}
                
                {product.costPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.costPrice}</label>
                    <p className="text-lg font-medium text-gray-600">{t.currency} {product.costPrice.toLocaleString()}</p>
                  </div>
                )}
                
                {product.costPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.profitMargin}</label>
                    <p className="text-lg font-medium text-green-600">{calculateProfitMargin(product.price, product.costPrice)}%</p>
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
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} width={300} height={300} className="w-full h-full object-cover" />
                ) : product.images && product.images.length > 0 ? (
                  <Image src={product.images[0].url} alt={product.name} width={300} height={300} className="w-full h-full object-cover" />
                ) : (
                  <ArchiveBoxIcon className="h-16 w-16 text-gray-400" />
                )}
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
              
              {inventory ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t.currentStock}</span>
                    <span className="font-semibold text-gray-900">{inventory.quantity}</span>
                  </div>
                  
                  {inventory.reservedQuantity !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.reservedStock}</span>
                      <span className="font-medium text-gray-700">{inventory.reservedQuantity}</span>
                    </div>
                  )}
                  
                  {inventory.maxStock && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.maxStock}</span>
                      <span className="font-medium text-gray-700">{inventory.maxStock}</span>
                    </div>
                  )}
                  
                  {inventory.reorderPoint && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t.reorderPoint}</span>
                      <span className="font-medium text-gray-700">{inventory.reorderPoint}</span>
                    </div>
                  )}
                  
                  {inventory.location && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{t.location}</span>
                      </div>
                      <p className="text-gray-900 font-medium">{inventory.location}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">{t.noData}</p>
              )}
            </motion.div>

            {/* Timestamps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.createdAt}</label>
                  <p className="text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.updatedAt}</label>
                  <p className="text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}