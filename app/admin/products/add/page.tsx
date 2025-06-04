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
import Link from 'next/link'

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
  currentStock: string
  minimumStock: string
  reorderLevel: string
  stockAlerts: boolean
  images: File[]
  primaryImageIndex: number
}

export default function AddEditProductPage() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [isEditing] = useState(false) // This would be determined by URL params
  const [activeTab, setActiveTab] = useState('info')
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
    currentStock: '',
    minimumStock: '',
    reorderLevel: '',
    stockAlerts: true,
    images: [],
    primaryImageIndex: 0
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

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

  const categories = [
    { value: '', label: t.selectCategory },
    { value: 'electronics', label: t.electronics },
    { value: 'clothing', label: t.clothing },
    { value: 'food', label: t.food },
    { value: 'home', label: t.home },
    { value: 'beauty', label: t.beauty },
    { value: 'sports', label: t.sports }
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

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length)
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      primaryImageIndex: prev.primaryImageIndex === index ? 0 : 
        prev.primaryImageIndex > index ? prev.primaryImageIndex - 1 : prev.primaryImageIndex
    }))
  }

  const calculatePrices = () => {
    const costPrice = parseFloat(formData.costPrice)
    if (!costPrice) return

    // Example calculation - 30% margin for wholesale, 50% for retail
    const wholesalePrice = Math.round(costPrice * 1.3)
    const retailPrice = Math.round(costPrice * 1.5)
    
    setFormData(prev => ({
      ...prev,
      wholesalePrice: wholesalePrice.toString(),
      retailPrice: retailPrice.toString()
    }))
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

                {/* Category & Product Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.category}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
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
                        <span className="font-medium">30%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{t.retailMargin}: </span>
                        <span className="font-medium">50%</span>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.images}</h3>
                
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t.dragDropImages}</p>
                    <p className="text-sm text-gray-500">{t.maxImages}</p>
                  </label>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative group border-2 rounded-lg overflow-hidden aspect-square ${
                          index === formData.primaryImageIndex ? 'border-teal-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
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
                          <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {t.primaryImage}
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
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                <CheckCircleIcon className="w-5 h-5" />
                <span>{isEditing ? t.updateProduct : t.publishProduct}</span>
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