'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useNotifications } from '../../../../contexts/NotificationContext'
import { useBusiness } from '../../../../contexts/BusinessContext'
import Link from 'next/link'
import { useCategories } from '../../../../hooks/useAdminProducts'
import Image from 'next/image'
import PermissionGate from '../../../../components/auth/PermissionGate'

interface ProductForm {
  nameEn: string
  nameSw: string
  descriptionEn: string
  descriptionSw: string
  category: string
  productType: 'wholesale' | 'retail' | 'both'
  sku: string
  barcode: string
  unit: string
  wholesalePrice: string
  retailPrice: string
  costPrice: string
  currentStock: string
  reservedStock: string
  minimumStock: string
  reorderLevel: string
  maxStock: string
  stockAlerts: boolean
  images: Array<{ id?: number; url: string; originalName: string; filename: string; size: number; type: string; isPrimary?: boolean; sortOrder?: number }>
  primaryImageIndex: number
}

function EditProductPageContent() {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const { currentBusiness } = useBusiness()
  const params = useParams()
  // const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('info')
  const [uploading, setUploading] = useState(false)
  const [businessSettings, setBusinessSettings] = useState<{
    wholesaleMargin: number;
    retailMargin: number;
  }>({
    wholesaleMargin: 30,
    retailMargin: 50
  })
  const [formData, setFormData] = useState<ProductForm>({
    nameEn: '',
    nameSw: '',
    descriptionEn: '',
    descriptionSw: '',
    category: '',
    productType: 'both',
    sku: '',
    barcode: '',
    unit: '',
    wholesalePrice: '',
    retailPrice: '',
    costPrice: '',
    currentStock: '',
    reservedStock: '',
    minimumStock: '',
    reorderLevel: '',
    maxStock: '',
    stockAlerts: true,
    images: [],
    primaryImageIndex: 0
  })

  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  useEffect(() => {
    setIsVisible(true)
    
    // Load business settings
    const loadBusinessSettings = async () => {
      if (!currentBusiness) return
      
      try {
        const res = await fetch(`/api/admin/business/settings?businessId=${currentBusiness.id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setBusinessSettings({
            wholesaleMargin: data.data.wholesaleMargin || 30,
            retailMargin: data.data.retailMargin || 50
          })
        }
      } catch (error) {
        console.error('Failed to load business settings:', error)
        // Keep default values if failed to load
      }
    }
    
    const loadProductData = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await fetch(`/api/admin/products/${params.id}`)
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch product')
        }
        
        if (data.success && data.data) {
          type ProductFromApi = {
            id: number;
            name: string;
            nameSwahili?: string;
            description?: string;
            category?: { id: number; name: string; nameSwahili?: string } | null;
            categoryId?: number;
            productType?: 'wholesale' | 'retail' | 'both';
            sku?: string;
            barcode?: string;
            unit?: string;
            wholesalePrice?: number;
            price?: number;
            costPrice?: number;
            inventory?: Array<{ 
              quantity?: number; 
              reservedQuantity?: number;
              reorderPoint?: number;
              maxStock?: number;
              location?: string;
            }>;
            images?: Array<{
              id: number;
              url: string;
              originalName: string;
              filename: string;
              size: number;
              mimeType: string;
              isPrimary?: boolean;
              sortOrder?: number;
            }>;
            isActive?: boolean;
            isDraft?: boolean;
          };
          const product: ProductFromApi = data.data;
          
          setFormData({
            nameEn: product.name || '',
            nameSw: product.nameSwahili || '',
            descriptionEn: product.description || '',
            descriptionSw: '',
            category: product.categoryId?.toString() || product.category?.id?.toString() || '',
            productType: product.productType || 'both',
            sku: product.sku || '',
            barcode: product.barcode || '',
            unit: product.unit || '',
            wholesalePrice: product.wholesalePrice?.toString() || '',
            retailPrice: product.price?.toString() || '',
            costPrice: product.costPrice?.toString() || '',
            currentStock: product.inventory?.[0]?.quantity?.toString() || '0',
            reservedStock: product.inventory?.[0]?.reservedQuantity?.toString() || '0',
            minimumStock: product.inventory?.[0]?.reorderPoint?.toString() || '0', // Use reorderPoint as minimumStock
            reorderLevel: product.inventory?.[0]?.reorderPoint?.toString() || '0',
            maxStock: product.inventory?.[0]?.maxStock?.toString() || '1000',
            stockAlerts: true,
            images: (product.images || []).map((img) => ({
              id: img.id,
              url: img.url,
              originalName: img.originalName,
              filename: img.filename,
              size: img.size,
              type: img.mimeType,
              isPrimary: img.isPrimary || false,
              sortOrder: img.sortOrder || 0
            })),
            primaryImageIndex: Math.max(0, (product.images || []).findIndex((img) => img.isPrimary))
          })
        } else {
          setLoadError(data.message || 'Product not found')
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load product')
      }
      setIsLoading(false)
    }
    
    if (currentBusiness) {
      loadBusinessSettings()
      loadProductData()
    }
  }, [params.id, currentBusiness])

  const translations = {
    en: {
      pageTitle: "Edit Product",
      backToProducts: "Back to Products",
      
      // Tabs
      productInfo: "Product Information",
      pricing: "Pricing",
      inventory: "Inventory",
      images: "Images",
      
      // Product Information
      productName: "Product Name",
      productNameEn: "Product Name (English)",
      productNameSw: "Product Name (Swahili)",
      productDescription: "Product Description",
      productDescriptionEn: "Description (English)",
      productDescriptionSw: "Description (Swahili)",
      category: "Category",
      selectCategory: "Select a category",
      productType: "Product Type",
      sku: "SKU / Product Code",
      barcode: "Barcode",
      unit: "Unit of Measurement",
      selectUnit: "Select unit",
      wholesale: "Wholesale Only",
      retail: "Retail Only",
      both: "Both Wholesale & Retail",
      
      // Pricing
      wholesalePrice: "Wholesale Price",
      retailPrice: "Retail Price",
      costPrice: "Cost Price",
      priceCalculator: "Price Calculator",
      profitMargin: "Profit Margin",
      calculatePrices: "Calculate Prices",
      currency: "TZS",
      
      // Inventory
      currentStock: "Current Stock",
      reservedStock: "Reserved Stock",
      minimumStock: "Minimum Stock Level",
      reorderLevel: "Reorder Level",
      maxStock: "Maximum Stock",
      stockAlerts: "Enable Stock Alerts",
      stockAlertsDesc: "Get notified when stock falls below minimum level",
      
      // Images
      uploadImages: "Upload Product Images",
      dragDropImages: "Drag and drop images here, or click to select",
      primaryImage: "Primary Image",
      setPrimary: "Set as Primary",
      removeImage: "Remove Image",
      maxImages: "Maximum 5 images allowed",
      
      // Form Actions
      saveDraft: "Save as Draft",
      updateProduct: "Update Product",
      cancel: "Cancel",
      
      // Categories
      electronics: "Electronics",
      clothing: "Clothing",
      food: "Food & Beverages",
      home: "Home & Garden",
      beauty: "Beauty & Personal Care",
      sports: "Sports & Outdoors",
      
      // Validation
      required: "This field is required",
      invalidPrice: "Please enter a valid price",
      invalidStock: "Please enter a valid stock number",
      
      // Calculator
      enterCostPrice: "Enter cost price to calculate",
      wholesaleMargin: "Wholesale Margin (%)",
      retailMargin: "Retail Margin (%)",
      calculatedWholesale: "Calculated Wholesale Price",
      calculatedRetail: "Calculated Retail Price",
      
      // Loading
      loading: "Loading product data..."
    },
    sw: {
      pageTitle: "Hariri Bidhaa",
      backToProducts: "Rudi kwenye Bidhaa",
      
      // Tabs
      productInfo: "Taarifa za Bidhaa",
      pricing: "Bei",
      inventory: "Hisa",
      images: "Picha",
      
      // Product Information
      productName: "Jina la Bidhaa",
      productNameEn: "Jina la Bidhaa (Kiingereza)",
      productNameSw: "Jina la Bidhaa (Kiswahili)",
      productDescription: "Maelezo ya Bidhaa",
      productDescriptionEn: "Maelezo (Kiingereza)",
      productDescriptionSw: "Maelezo (Kiswahili)",
      category: "Kundi",
      selectCategory: "Chagua kundi",
      productType: "Aina ya Bidhaa",
      sku: "Nambari ya Bidhaa",
      barcode: "Barcode",
      unit: "Kipimo cha Bidhaa",
      selectUnit: "Chagua kipimo",
      wholesale: "Jumla Tu",
      retail: "Rejareja Tu",
      both: "Jumla na Rejareja",
      
      // Pricing
      wholesalePrice: "Bei ya Jumla",
      retailPrice: "Bei ya Rejareja",
      costPrice: "Bei ya Gharama",
      priceCalculator: "Kikokotozi cha Bei",
      profitMargin: "Faida",
      calculatePrices: "Kokotoa Bei",
      currency: "TSh",
      
      // Inventory
      currentStock: "Hisa ya Sasa",
      reservedStock: "Hisa Iliyohifadhiwa",
      minimumStock: "Kiwango cha Hisa Kidogo",
      reorderLevel: "Kiwango cha Kuagiza Upya",
      maxStock: "Hisa ya Juu",
      stockAlerts: "Wezesha Arifa za Hisa",
      stockAlertsDesc: "Pata arifa wakati hisa inapungua chini ya kiwango",
      
      // Images
      uploadImages: "Pakia Picha za Bidhaa",
      dragDropImages: "Buruta na dondosha picha hapa, au bofya kuchagua",
      primaryImage: "Picha Kuu",
      setPrimary: "Weka kama Kuu",
      removeImage: "Ondoa Picha",
      maxImages: "Picha 5 tu zinaruhusiwa",
      
      // Form Actions
      saveDraft: "Hifadhi kama Dondoo",
      updateProduct: "Sasisha Bidhaa",
      cancel: "Ghairi",
      
      // Categories
      electronics: "Vifaa vya Umeme",
      clothing: "Nguo",
      food: "Chakula na Vinywaji",
      home: "Nyumba na Bustani",
      beauty: "Urembo na Huduma za Kibinafsi",
      sports: "Michezo na Nje",
      
      // Validation
      required: "Uga huu unahitajika",
      invalidPrice: "Tafadhali ingiza bei sahihi",
      invalidStock: "Tafadhali ingiza nambari sahihi ya hisa",
      
      // Calculator
      enterCostPrice: "Ingiza bei ya gharama ili kukokotoa",
      wholesaleMargin: "Faida ya Jumla (%)",
      retailMargin: "Faida ya Rejareja (%)",
      calculatedWholesale: "Bei ya Jumla Iliyokokotolewa",
      calculatedRetail: "Bei ya Rejareja Iliyokokotolewa",
      
      // Loading
      loading: "Inapakia data ya bidhaa..."
    }
  }

  const t = translations[language]

  const tabs = [
    { id: 'info', label: t.productInfo, icon: DocumentTextIcon },
    { id: 'pricing', label: t.pricing, icon: CalculatorIcon },
    { id: 'inventory', label: t.inventory, icon: ExclamationTriangleIcon },
    { id: 'images', label: t.images, icon: PhotoIcon }
  ]

  const handleInputChange = (field: keyof ProductForm, value: string | boolean | number) => {
    console.log(`Changing ${field} to:`, value)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      return newData
    })
    
    // Show feedback for primary image change
    if (field === 'primaryImageIndex' && typeof value === 'number') {
      const successMessage = language === 'sw'
        ? `Picha ya ${value + 1} imewekwa kama picha kuu`
        : `Image ${value + 1} set as primary image`
      showSuccess(
        language === 'sw' ? 'Mafanikio' : 'Success',
        successMessage
      )
    }
  }

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return
    
    if (!currentBusiness) {
      showError(language === 'sw' ? 'Hitilafu' : 'Error', 'No business selected')
      return
    }
    
    setUploading(true)
    try {
      // Check file limit
      if (formData.images.length + files.length > 5) {
        const errorMessage = language === 'sw'
          ? 'Unaweza kupakia picha 5 tu. Tafadhali ondoa baadhi za picha za zamani.'
          : 'You can only upload up to 5 images. Please remove some existing images first.'
        showError(
          language === 'sw' ? 'Hitilafu' : 'Error',
          errorMessage
        )
        return
      }
      
      // Upload images to server
      const formDataUpload = new FormData()
      formDataUpload.append('businessId', currentBusiness.id.toString())
      Array.from(files).forEach((file) => {
        formDataUpload.append('images', file)
      })
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload
      })
      
      const data = await res.json()
      
      if (res.ok && data.success && data.data?.files) {
        type UploadedImage = {
          url: string;
          originalName: string;
          filename: string;
          size: number;
          type: string;
        };
        const newUploadedImages: UploadedImage[] = data.data.files.map((file: UploadedImage) => ({
          url: file.url,
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          type: file.type
        }))
        
        setFormData((prev: ProductForm) => ({
          ...prev,
          images: [...prev.images, ...newUploadedImages]
        }))
        
        // Clear file input
        const fileInput = document.getElementById('image-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        const successMessage = language === 'sw'
          ? `Picha ${newUploadedImages.length} zimepakiwa kwa mafanikio!`
          : `${newUploadedImages.length} image(s) uploaded successfully!`
        showSuccess(
          language === 'sw' ? 'Mafanikio' : 'Success',
          successMessage
        )
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      const errorMessage = language === 'sw'
        ? 'Imeshindwa kupakia picha. Jaribu tena.'
        : 'Failed to upload images. Please try again.'
      showError(
        language === 'sw' ? 'Hitilafu' : 'Error',
        errorMessage
      )
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev: ProductForm) => ({
      ...prev,
      images: prev.images.filter((_: unknown, i: number) => i !== index),
      primaryImageIndex: prev.primaryImageIndex === index ? 0 : 
        prev.primaryImageIndex > index ? prev.primaryImageIndex - 1 : prev.primaryImageIndex
    }))
  }

  const calculatePrices = () => {
    const costPrice = parseFloat(formData.costPrice)
    if (!costPrice) return

    // Use dynamic margins from business settings
    const wholesaleMultiplier = 1 + (businessSettings.wholesaleMargin / 100)
    const retailMultiplier = 1 + (businessSettings.retailMargin / 100)
    
    const wholesalePrice = Math.round(costPrice * wholesaleMultiplier)
    const retailPrice = Math.round(costPrice * retailMultiplier)
    
    setFormData(prev => ({
      ...prev,
      wholesalePrice: wholesalePrice.toString(),
      retailPrice: retailPrice.toString()
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Prepare images array
      const images = formData.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === formData.primaryImageIndex,
        sortOrder: idx
      }))
      // Prepare payload
      const payload = {
        nameEn: formData.nameEn,
        nameSw: formData.nameSw,
        descriptionEn: formData.descriptionEn,
        category: formData.category,
        productType: formData.productType,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        currentStock: formData.currentStock ? parseInt(formData.currentStock) : undefined,
        minimumStock: formData.minimumStock ? parseInt(formData.minimumStock) : undefined,
        reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : undefined,
        stockAlerts: formData.stockAlerts,
        images,
        isDraft: false
      }
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        const successMessage = language === 'sw' 
          ? 'Bidhaa imesasishwa kwa mafanikio!'
          : 'Product updated successfully!'
        showSuccess(
          language === 'sw' ? 'Mafanikio' : 'Success',
          successMessage
        )
        // Optionally refetch or reload
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const errorMessage = language === 'sw'
          ? 'Imeshindwa kusasisha bidhaa: ' + (data.message || 'Hitilafu isiyojulikana')
          : 'Failed to update product: ' + (data.message || 'Unknown error')
        showError(
          language === 'sw' ? 'Hitilafu' : 'Error',
          errorMessage
        )
      }
    } catch (e) {
      const errorMessage = language === 'sw'
        ? 'Hitilafu ya kusasisha bidhaa: ' + (e instanceof Error ? e.message : e)
        : 'Error updating product: ' + (e instanceof Error ? e.message : e)
      showError(
        language === 'sw' ? 'Hitilafu' : 'Error',
        errorMessage
      )
    }
    setIsLoading(false)
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Product</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <Link
            href="/admin/products"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin/products"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t.backToProducts}</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
              {t.pageTitle}
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="mb-6 lg:mb-8 overflow-x-auto">
        <nav className="flex space-x-4 lg:space-x-8 border-b border-gray-200 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 lg:py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
      </motion.div>

      {/* Form Content */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        {/* Main Form */}
        <div className="flex-1 xl:flex-[2] min-w-0">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
            {/* Product Information Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.productInfo}</h3>
                
                {/* Product Names */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productNameEn}
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => handleInputChange('nameEn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="Enter product name in English"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productNameSw}
                    </label>
                    <input
                      type="text"
                      value={formData.nameSw}
                      onChange={(e) => handleInputChange('nameSw', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="Ingiza jina la bidhaa kwa Kiswahili"
                    />
                  </div>
                </div>

                {/* SKU, Barcode & Unit */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sku}
                    </label>
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder={language === 'en' ? 'SKU123' : 'BDH123'}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.barcode}
                    </label>
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="123456789"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.unit}
                    </label>
                    <select
                      value={formData.unit || ''}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    >
                      <option value="">{t.selectUnit}</option>
                      <option value="pieces">{language === 'en' ? 'Pieces' : 'Vipande'}</option>
                      <option value="kg">{language === 'en' ? 'Kilograms (kg)' : 'Kilogramu (kg)'}</option>
                      <option value="g">{language === 'en' ? 'Grams (g)' : 'Gramu (g)'}</option>
                      <option value="liters">{language === 'en' ? 'Liters' : 'Lita'}</option>
                      <option value="ml">{language === 'en' ? 'Milliliters (ml)' : 'Mililita (ml)'}</option>
                      <option value="meters">{language === 'en' ? 'Meters' : 'Mita'}</option>
                      <option value="cm">{language === 'en' ? 'Centimeters' : 'Sentimita'}</option>
                      <option value="boxes">{language === 'en' ? 'Boxes' : 'Masanduku'}</option>
                      <option value="packs">{language === 'en' ? 'Packs' : 'Vifurushi'}</option>
                    </select>
                  </div>
                </div>

                {/* Category & Product Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.category}
                    </label>
                    {categoriesLoading ? (
                      <div className="text-gray-500 text-sm py-2">Loading categories...</div>
                    ) : categoriesError ? (
                      <div className="text-red-500 text-sm py-2">Failed to load categories</div>
                    ) : (
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      >
                        <option value="">{t.selectCategory}</option>
                        {categories.map((category: { id: number; name: string; nameSwahili?: string }) => (
                          <option key={category.id} value={category.id}>
                            {language === 'sw' && category.nameSwahili ? category.nameSwahili : category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productType}
                    </label>
                    <select
                      value={formData.productType}
                      onChange={(e) => handleInputChange('productType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    >
                      <option value="wholesale">{t.wholesale}</option>
                      <option value="retail">{t.retail}</option>
                      <option value="both">{t.both}</option>
                    </select>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productDescriptionEn}
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white resize-none"
                      placeholder="Enter product description in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productDescriptionSw}
                    </label>
                    <textarea
                      value={formData.descriptionSw}
                      onChange={(e) => handleInputChange('descriptionSw', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white resize-none"
                      placeholder="Ingiza maelezo ya bidhaa kwa Kiswahili"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-800">{t.pricing}</h3>
                  <button
                    onClick={calculatePrices}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors w-full sm:w-auto"
                  >
                    <CalculatorIcon className="w-4 h-4" />
                    <span>{t.calculatePrices}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.costPrice} ({t.currency})
                    </label>
                    <input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => handleInputChange('costPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="0"
                    />
                  </div>
                  
                  {(formData.productType === 'wholesale' || formData.productType === 'both') && (
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.wholesalePrice} ({t.currency})
                      </label>
                      <input
                        type="number"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        placeholder="0"
                      />
                    </div>
                  )}
                  
                  {(formData.productType === 'retail' || formData.productType === 'both') && (
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.retailPrice} ({t.currency})
                      </label>
                      <input
                        type="number"
                        value={formData.retailPrice}
                        onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                {/* Price Calculator Helper */}
                {formData.costPrice && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{t.priceCalculator}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{t.wholesaleMargin}: </span>
                        <span className="font-medium text-teal-900 font-bold">{businessSettings.wholesaleMargin}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{t.retailMargin}: </span>
                        <span className="font-medium text-teal-900 font-bold">{businessSettings.retailMargin}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.inventory}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.currentStock}
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange('currentStock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.reservedStock}
                    </label>
                    <input
                      type="number"
                      value={formData.reservedStock}
                      onChange={(e) => handleInputChange('reservedStock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.minimumStock}
                    </label>
                    <input
                      type="number"
                      value={formData.minimumStock}
                      onChange={(e) => handleInputChange('minimumStock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.reorderLevel}
                    </label>
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.maxStock}
                    </label>
                    <input
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange('maxStock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* Inventory Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Inventory Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Available Stock: </span>
                      <span className="font-medium text-blue-800">
                        {(parseInt(formData.currentStock) || 0) - (parseInt(formData.reservedStock) || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Stock Status: </span>
                      <span className={`font-medium ${
                        (parseInt(formData.currentStock) || 0) <= (parseInt(formData.minimumStock) || 0) 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {(parseInt(formData.currentStock) || 0) <= (parseInt(formData.minimumStock) || 0) 
                          ? 'Low Stock' 
                          : 'In Stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{t.stockAlerts}</h4>
                    <p className="text-sm text-gray-600">{t.stockAlertsDesc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.stockAlerts}
                      onChange={(e) => handleInputChange('stockAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.images}</h3>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploading ? (
                      <div className="w-12 h-12 mx-auto mb-4 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-gray-600 mb-2">
                      {uploading 
                        ? (language === 'sw' ? 'Inapakia picha...' : 'Uploading images...')
                        : t.dragDropImages
                      }
                    </p>
                    <p className="text-sm text-gray-500">{t.maxImages}</p>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative group border-2 rounded-lg overflow-hidden aspect-square transition-all duration-200 ${
                          index === formData.primaryImageIndex 
                            ? 'border-teal-500 ring-2 ring-teal-200 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                          <Image
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-2">
                              {index !== formData.primaryImageIndex && (
                                <button
                                  onClick={() => {
                                    console.log('Setting primary image index to:', index)
                                    console.log('Current primary index:', formData.primaryImageIndex)
                                    handleInputChange('primaryImageIndex', index)
                                  }}
                                  className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                  title={t.setPrimary}
                                >
                                  <StarIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => removeImage(index)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                title={t.removeImage}
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Primary Badge */}
                        {index === formData.primaryImageIndex && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-md">
                            <StarIcon className="w-3 h-3 fill-current" />
                            <span>{t.primaryImage}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="xl:flex-[1] xl:max-w-sm">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 xl:sticky xl:top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={handleSubmit}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>{t.updateProduct}</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium py-3 px-4 rounded-xl transition-colors">
                <ClockIcon className="w-5 h-5" />
                <span>{t.saveDraft}</span>
              </button>
              
              <Link 
                href="/admin/products"
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                <span>{t.cancel}</span>
              </Link>
            </div>

            {/* Form Progress */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Form Progress</h4>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <div key={tab.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate">{tab.label}</span>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0">
                      {/* Add completion logic here */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function EditProductPage() {
  return (
    <PermissionGate requiredPermission="products.update">
      <EditProductPageContent />
    </PermissionGate>
  )
}