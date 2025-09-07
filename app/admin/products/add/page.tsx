'use client'

import { useState, useEffect } from 'react'
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
import { useLanguage } from '../../../contexts/LanguageContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useBusiness } from '../../../contexts/BusinessContext'
import { useAddProductForm } from '../../../hooks/useAdminProducts'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import PermissionGate from '../../../components/auth/PermissionGate'

interface ProductForm {
  nameEn: string
  nameSw: string
  descriptionEn: string
  descriptionSw: string
  category: string
  productType: 'wholesale' | 'retail' | 'both'
  wholesalePrice: string
  retailPrice: string
  costPrice: string
  sku: string
  barcode: string
  unit: string
  currentStock: string
  minimumStock: string
  reorderLevel: string
  maxStock: string
  stockAlerts: boolean
  images: File[]
  primaryImageIndex: number
}

interface Category {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  productCount?: number
}

function AddEditProductPageContent() {
  const { language } = useLanguage()
  const { showSuccess, showError, showWarning } = useNotifications()
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const { categories, imageUpload, productManagement } = useAddProductForm()
  
  const [isVisible, setIsVisible] = useState(false)
  const [isEditing] = useState(false) // This would be determined by URL params
  const [activeTab, setActiveTab] = useState('info')
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; originalName: string; filename: string; size: number; type: string }>>([])
  const [businessSettings, setBusinessSettings] = useState({
    wholesaleMargin: 1, // Default fallback
    retailMargin: 1 // Default fallback
  })
  const [formData, setFormData] = useState<ProductForm>({
    nameEn: '',
    nameSw: '',
    descriptionEn: '',
    descriptionSw: '',
    category: '',
    productType: 'both',
    wholesalePrice: '',
    retailPrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    unit: '',
    currentStock: '',
    minimumStock: '',
    reorderLevel: '',
    maxStock: '',
    stockAlerts: true,
    images: [],
    primaryImageIndex: 0
  })

  // Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files)
    }
  }

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
    
    if (currentBusiness) {
      loadBusinessSettings()
    }
  }, [currentBusiness])

  const translations = {
    en: {
      pageTitle: "Add New Product",
      editTitle: "Edit Product",
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
      wholesale: "Wholesale Only",
      retail: "Retail Only",
      both: "Both Wholesale & Retail",
      sku: "SKU / Product Code",
      barcode: "Barcode",
      unit: "Unit of Measurement",
      selectUnit: "Select unit",
      
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
      minimumStock: "Minimum Stock Level",
      reorderLevel: "Reorder Level",
      maxStock: "Maximum Stock Level",
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
      publishProduct: "Publish Product",
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
      calculatedRetail: "Calculated Retail Price"
    },
    sw: {
      pageTitle: "Ongeza Bidhaa Mpya",
      editTitle: "Hariri Bidhaa",
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
      minimumStock: "Kiwango cha Hisa Kidogo",
      reorderLevel: "Kiwango cha Kuagiza Upya",
      maxStock: "Kiwango cha Juu cha Hisa",
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
      publishProduct: "Chapisha Bidhaa",
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
      calculatedRetail: "Bei ya Rejareja Iliyokokotolewa"
    }
  }

  const t = translations[language]

  // Build categories dropdown options from API data
  const categoryOptions = [
    { value: '', label: t.selectCategory },
    ...(categories.categories || []).map((cat: Category) => ({
      value: cat.name,
      label: language === 'sw' && cat.nameSwahili ? cat.nameSwahili : cat.name
    }))
  ]

  const tabs = [
    { id: 'info', label: t.productInfo, icon: DocumentTextIcon },
    { id: 'pricing', label: t.pricing, icon: CalculatorIcon },
    { id: 'inventory', label: t.inventory, icon: ExclamationTriangleIcon },
    { id: 'images', label: t.images, icon: PhotoIcon }
  ]

  const handleInputChange = (field: keyof ProductForm, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (files: FileList) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length)
    
    console.log('Uploading files:', {
      filesCount: files.length,
      newImagesCount: newImages.length,
      existingImagesCount: formData.images.length,
      existingUploadedCount: uploadedImages.length
    })
    
    // Upload images to server
    if (newImages.length > 0) {
      const uploadResult = await imageUpload.uploadImages(files)
      
      console.log('Upload result:', uploadResult)
      
      if (uploadResult.success && uploadResult.files) {
        const newUploadedImages = uploadResult.files.map((file) => ({
          url: file.url,
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          type: file.type
        }))
        
        console.log('New uploaded images:', newUploadedImages)
        
        setUploadedImages(prev => {
          const updated = [...prev, ...newUploadedImages]
          console.log('Updated uploaded images:', updated)
          return updated
        })
        
        // Update form data with File objects for local state
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }))

        showSuccess(
          language === 'en' ? 'Images Uploaded' : 'Picha Zimepakiwa',
          language === 'en' 
            ? `${newUploadedImages.length} image(s) uploaded successfully`
            : `Picha ${newUploadedImages.length} zimepakiwa kikamilifu`
        )
      } else {
        console.error('Upload failed:', uploadResult.error)
        showError(
          language === 'en' ? 'Upload Failed' : 'Kupakia Kumeshindwa',
          uploadResult.error || (language === 'en' ? 'Failed to upload images' : 'Imeshindwa kupakia picha')
        )
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      primaryImageIndex: prev.primaryImageIndex === index ? 0 : 
        prev.primaryImageIndex > index ? prev.primaryImageIndex - 1 : prev.primaryImageIndex
    }))
    
    // Also remove from uploaded images
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
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

  // Comprehensive form validation
  const validateForm = (isDraft = false) => {
    const errors: Array<{ field: string; message: string; tab: string }> = []

    // Required fields for published products
    if (!isDraft) {
      if (!formData.nameEn.trim()) {
        errors.push({ field: 'nameEn', message: t.productNameEn, tab: 'info' })
      }
      
      if (!formData.category) {
        errors.push({ field: 'category', message: t.category, tab: 'info' })
      }

      if (!formData.unit) {
        errors.push({ field: 'unit', message: t.unit, tab: 'info' })
      }

      // At least one price must be provided based on product type
      if (formData.productType === 'wholesale' || formData.productType === 'both') {
        if (!formData.wholesalePrice || parseFloat(formData.wholesalePrice) <= 0) {
          errors.push({ field: 'wholesalePrice', message: t.wholesalePrice, tab: 'pricing' })
        }
      }
      
      if (formData.productType === 'retail' || formData.productType === 'both') {
        if (!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) {
          errors.push({ field: 'retailPrice', message: t.retailPrice, tab: 'pricing' })
        }
      }

      // Stock validation - mandatory for published products
      if (!formData.currentStock || formData.currentStock.trim() === '') {
        errors.push({ field: 'currentStock', message: t.currentStock, tab: 'inventory' })
      } else if (isNaN(parseInt(formData.currentStock))) {
        errors.push({ field: 'currentStock', message: t.invalidStock, tab: 'inventory' })
      }
      
      if (!formData.minimumStock || formData.minimumStock.trim() === '') {
        errors.push({ field: 'minimumStock', message: t.minimumStock, tab: 'inventory' })
      } else if (isNaN(parseInt(formData.minimumStock))) {
        errors.push({ field: 'minimumStock', message: t.invalidStock, tab: 'inventory' })
      }
      
      if (!formData.reorderLevel || formData.reorderLevel.trim() === '') {
        errors.push({ field: 'reorderLevel', message: t.reorderLevel, tab: 'inventory' })
      } else if (isNaN(parseInt(formData.reorderLevel))) {
        errors.push({ field: 'reorderLevel', message: t.invalidStock, tab: 'inventory' })
      }

      // Image validation - at least one image required
      if (uploadedImages.length === 0) {
        errors.push({ field: 'images', message: t.uploadImages, tab: 'images' })
      }
    }

    // Basic validation for drafts (minimal requirements)
    if (isDraft) {
      if (!formData.nameEn.trim()) {
        errors.push({ field: 'nameEn', message: t.productNameEn, tab: 'info' })
      }
    }

    return errors
  }

  // Form submission handlers
  const handleSaveDraft = async () => {
    const validationErrors = validateForm(true)
    
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0]
      showWarning(
        language === 'en' ? 'Validation Error' : 'Tatizo la Uthibitisho',
        `${t.required}: ${firstError.message}`
      )
      setActiveTab(firstError.tab)
      return
    }

    const primaryImageUrl = uploadedImages[formData.primaryImageIndex]?.url
    const result = await productManagement.saveDraft(formData, primaryImageUrl, uploadedImages)
    
    if (result.success) {
      showSuccess(
        language === 'en' ? 'Draft Saved' : 'Dondoo Limehifadhiwa',
        language === 'en' ? 'Product saved as draft successfully' : 'Bidhaa imehifadhiwa kama dondoo kikamilifu'
      )
      router.push('/admin/products')
    } else {
      showError(
        language === 'en' ? 'Save Failed' : 'Kuhifadhi Kumeshindwa',
        result.error || (language === 'en' ? 'Failed to save draft' : 'Imeshindwa kuhifadhi dondoo')
      )
    }
  }

  const handlePublishProduct = async () => {
    const validationErrors = validateForm(false)
    
    console.log('Form data before publishing:', {
      formData,
      uploadedImages,
      primaryImageIndex: formData.primaryImageIndex
    })
    
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0]
      const errorList = validationErrors.map(e => `• ${e.message}`).join('\n')
      
      showWarning(
        language === 'en' ? 'Please Complete Required Fields' : 'Tafadhali Jaza Sehemu Zinazohitajika',
        language === 'en' 
          ? `The following fields are required:\n${errorList}`
          : `Sehemu hizi zinahitajika:\n${errorList}`
      )
      setActiveTab(firstError.tab)
      return
    }

    // Update primary image selection in uploadedImages based on user selection
    const updatedUploadedImages = uploadedImages.map((img, index) => ({
      ...img,
      isPrimary: index === formData.primaryImageIndex
    }))

    console.log('Updated uploaded images with primary selection:', updatedUploadedImages)

    const primaryImageUrl = uploadedImages[formData.primaryImageIndex]?.url
    const result = await productManagement.publishProduct(formData, primaryImageUrl, updatedUploadedImages)
    
    if (result.success) {
      showSuccess(
        language === 'en' ? 'Product Published' : 'Bidhaa Imechapishwa',
        language === 'en' ? 'Product published successfully' : 'Bidhaa imechapishwa kikamilifu'
      )
      router.push('/admin/products')
    } else {
      showError(
        language === 'en' ? 'Publish Failed' : 'Kuchapisha Kumeshindwa',
        result.error || (language === 'en' ? 'Failed to publish product' : 'Imeshindwa kuchapisha bidhaa')
      )
    }
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
              {isEditing ? t.editTitle : t.pageTitle}
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
                      {t.productNameEn} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => handleInputChange('nameEn', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                        !formData.nameEn.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name in English"
                    />
                    {!formData.nameEn.trim() && (
                      <p className="text-red-500 text-xs mt-1">{t.required}</p>
                    )}
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

                {/* Category & Product Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.category} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      disabled={categories.loading}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white disabled:bg-gray-100 ${
                        !formData.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {categories.loading ? (
                        <option value="">Loading categories...</option>
                      ) : (
                        categoryOptions.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))
                      )}
                    </select>
                    {categories.error && (
                      <p className="text-red-500 text-sm mt-1">{categories.error}</p>
                    )}
                    {!formData.category && !categories.loading && (
                      <p className="text-red-500 text-xs mt-1">{t.required}</p>
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

                {/* SKU, Barcode & Unit */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sku}
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
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
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                      placeholder="123456789"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.unit} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                        !formData.unit ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
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
                    {!formData.unit && (
                      <p className="text-red-500 text-xs mt-1">{t.required}</p>
                    )}
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
                        {t.wholesalePrice} ({t.currency}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                          (!formData.wholesalePrice || parseFloat(formData.wholesalePrice) <= 0) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                      {(!formData.wholesalePrice || parseFloat(formData.wholesalePrice) <= 0) && (
                        <p className="text-red-500 text-xs mt-1">{t.required}</p>
                      )}
                    </div>
                  )}
                  
                  {(formData.productType === 'retail' || formData.productType === 'both') && (
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.retailPrice} ({t.currency}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.retailPrice}
                        onChange={(e) => handleInputChange('retailPrice', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                          (!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                      {(!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) && (
                        <p className="text-red-500 text-xs mt-1">{t.required}</p>
                      )}
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
                        <span className="font-medium text-teal-700 font-bold">{businessSettings.wholesaleMargin}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{t.retailMargin}: </span>
                        <span className="font-medium text-teal-700 font-bold">{businessSettings.retailMargin}%</span>
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
                      {t.currentStock} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange('currentStock', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                        (!formData.currentStock || formData.currentStock.trim() === '') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {(!formData.currentStock || formData.currentStock.trim() === '') && (
                      <p className="text-red-500 text-xs mt-1">{t.required}</p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.minimumStock} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minimumStock}
                      onChange={(e) => handleInputChange('minimumStock', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                        (!formData.minimumStock || formData.minimumStock.trim() === '') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {(!formData.minimumStock || formData.minimumStock.trim() === '') && (
                      <p className="text-red-500 text-xs mt-1">{t.required}</p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.reorderLevel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white ${
                        (!formData.reorderLevel || formData.reorderLevel.trim() === '') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {(!formData.reorderLevel || formData.reorderLevel.trim() === '') && (
                      <p className="text-red-500 text-xs mt-1">{t.required}</p>
                    )}
                  </div>
                </div>

                {/* Max Stock */}
                <div className="grid grid-cols-1 gap-4">
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
                    <p className="mt-1 text-xs text-gray-500">
                      {language === 'en' ? 'All products start in Main Store. Use Transfer feature to move to Retail Store.' : 'Bidhaa zote zinaanza Main Store. Tumia Transfer kuhamisha kwenda Retail Store.'}
                    </p>
                  </div>
                </div>

                {/* Stock Alerts */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{t.stockAlerts}</h4>
                    <p className="text-sm text-gray-600">{t.stockAlertsDesc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t.images} <span className="text-red-500">*</span>
                  </h3>
                  <div className="text-sm text-gray-600">
                    {formData.images.length}/5 {language === 'en' ? 'images' : 'picha'}
                  </div>
                </div>
                
                {/* Image Upload */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 lg:p-8 text-center transition-all duration-200 ${
                    isDragOver 
                      ? 'border-teal-500 bg-teal-50' 
                      : uploadedImages.length === 0 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-teal-500'
                  } ${formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => formData.images.length < 5 && document.getElementById('image-upload')?.click()}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    disabled={formData.images.length >= 5}
                  />
                  
                  {imageUpload.uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                      <p className="text-gray-600 mb-2">
                        {language === 'en' ? 'Uploading images...' : 'Inapakia picha...'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        {isDragOver 
                          ? (language === 'en' ? 'Drop images here' : 'Dondosha picha hapa')
                          : t.dragDropImages
                        }
                      </p>
                      <p className="text-sm text-gray-500">{t.maxImages}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {language === 'en' ? 'Supported: JPEG, PNG, WebP (Max 5MB each)' : 'Inazungumzwa: JPEG, PNG, WebP (Juu ya 5MB kila moja)'}
                      </p>
                    </div>
                  )}
                </div>
                
                {uploadedImages.length === 0 && !imageUpload.uploading && (
                  <p className="text-red-500 text-xs">{t.uploadImages} - {t.required}</p>
                )}

                {/* Image Preview */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">
                        {language === 'en' ? 'Uploaded Images' : 'Picha Zilizopakiwa'}
                      </h4>
                      <button
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={formData.images.length >= 5 || imageUpload.uploading}
                        className="text-sm text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        + {language === 'en' ? 'Add More' : 'Ongeza Zaidi'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((uploadedImage, index) => (
                        <div
                          key={uploadedImage.url}
                          className={`relative group border-2 rounded-lg overflow-hidden aspect-square transition-all duration-200 ${
                            index === formData.primaryImageIndex ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={uploadedImage.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            width={200}
                            height={200}
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-2">
                                {index !== formData.primaryImageIndex && (
                                  <button
                                    onClick={() => handleInputChange('primaryImageIndex', index)}
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
                            <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                              <StarIcon className="w-3 h-3" />
                              <span>{t.primaryImage}</span>
                            </div>
                          )}
                          
                          {/* Image info */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                            <p className="text-white text-xs truncate">
                              {uploadedImage.originalName}
                            </p>
                            <p className="text-white text-xs opacity-75">
                              {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
                onClick={handlePublishProduct}
                disabled={productManagement.saving || imageUpload.uploading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {productManagement.saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : imageUpload.uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'en' ? 'Uploading...' : 'Inapakia...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{isEditing ? t.updateProduct : t.publishProduct}</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={handleSaveDraft}
                disabled={productManagement.saving || imageUpload.uploading}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {productManagement.saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    <span>Saving...</span>
                  </>
                ) : imageUpload.uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    <span>{language === 'en' ? 'Uploading...' : 'Inapakia...'}</span>
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-5 h-5" />
                    <span>{t.saveDraft}</span>
                  </>
                )}
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

export default function AddEditProductPage() {
  return (
    <PermissionGate requiredPermission="products.create">
      <AddEditProductPageContent />
    </PermissionGate>
  )
} 