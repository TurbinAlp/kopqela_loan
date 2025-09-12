import { useState, useEffect, useCallback } from 'react'
import { useBusiness } from '../contexts/BusinessContext'

interface Category {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  productCount?: number
}

interface ProductFormData {
  nameEn: string
  nameSw: string
  descriptionEn: string
  descriptionSw: string
  category: string
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

  isDraft?: boolean
}



interface CreateCategoryData {
  name: string
  nameSwahili?: string
  description?: string
}

interface UpdateCategoryData {
  name: string
  nameSwahili?: string
  description?: string
  isActive?: boolean
}

// Hook for fetching categories
export function useCategories() {
  const { currentBusiness } = useBusiness()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!currentBusiness) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/categories?businessId=${currentBusiness.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to fetch categories: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setCategories(data.data.categories)
      } else {
        throw new Error(data.message || 'Unknown error occurred')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentBusiness])

  const createCategory = async (categoryData: CreateCategoryData) => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...categoryData,
          businessId: currentBusiness.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.message || 'Failed to create category' }
      }

      const data = await response.json()
      if (data.success) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Unknown error occurred' }
      }
    } catch (err) {
      console.error('Error creating category:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' }
    }
  }

  const updateCategory = async (categoryId: number, categoryData: UpdateCategoryData) => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...categoryData,
          businessId: currentBusiness.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.message || 'Failed to update category' }
      }

      const data = await response.json()
      if (data.success) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Unknown error occurred' }
      }
    } catch (err) {
      console.error('Error updating category:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' }
    }
  }

  const deleteCategory = async (categoryId: number) => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}?businessId=${currentBusiness.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.message || 'Failed to delete category' }
      }

      const data = await response.json()
      if (data.success) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.message || 'Unknown error occurred' }
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred' }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [currentBusiness, fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}

// Hook for uploading images
export function useImageUpload() {
  const { currentBusiness } = useBusiness()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImages = async (files: FileList): Promise<{ success: boolean; urls?: string[]; files?: Array<{ url: string; originalName: string; filename: string; size: number; type: string }>; error?: string }> => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('businessId', currentBusiness.id.toString())
      Array.from(files).forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload images')
      }

      const data = await response.json()
      if (data.success && data.data.files) {
        const urls = data.data.files.map((file: { url: string }) => file.url)
        return { 
          success: true, 
          urls,
          files: data.data.files
        }
      } else {
        throw new Error(data.message || 'Unknown error occurred')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }

  const getUploadInfo = async () => {
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to get upload info')
      }

      const data = await response.json()
      return data.success ? data.data : null
    } catch (err) {
      console.error('Error getting upload info:', err)
      return null
    }
  }

  return {
    uploading,
    error,
    uploadImages,
    getUploadInfo
  }
}

// Hook for product management
export function useProductManagement() {
  const { currentBusiness } = useBusiness()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProduct = async (formData: ProductFormData, primaryImageUrl?: string, uploadedImages?: Array<{ url: string; originalName: string; filename: string; size: number; type: string }>): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    if (!currentBusiness) {
      return { success: false, error: 'No business selected' }
    }

    try {
      setSaving(true)
      setError(null)

      // Prepare images data for API
      let imagesData: Array<{
        url: string;
        filename: string;
        originalName: string;
        size: number;
        mimeType: string;
        isPrimary: boolean;
        sortOrder: number;
      }> = []

      if (uploadedImages && uploadedImages.length > 0) {
        imagesData = uploadedImages.map((image, index) => ({
          url: image.url,
          filename: image.filename,
          originalName: image.originalName,
          size: image.size,
          mimeType: image.type,
          isPrimary: index === 0, // First image is primary by default
          sortOrder: index
        }))
      }

      // Prepare the data for API
      const productData = {
        nameEn: formData.nameEn,
        nameSw: formData.nameSw || undefined,
        descriptionEn: formData.descriptionEn || undefined,
        descriptionSw: formData.descriptionSw || undefined,
        category: formData.category,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        unit: formData.unit,
        currentStock: formData.currentStock ? parseInt(formData.currentStock) : 0,
        minimumStock: formData.minimumStock ? parseInt(formData.minimumStock) : undefined,
        reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : undefined,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
        stockAlerts: formData.stockAlerts,

        images: imagesData.length > 0 ? imagesData : undefined, // New: Multiple images
        isDraft: formData.isDraft || false
      }

      console.log('Sending product data:', JSON.stringify(productData, null, 2))

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: currentBusiness.id,
          ...productData
        })
      })

      console.log('API Response status:', response.status)
      console.log('API Response statusText:', response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        
        // Log detailed validation errors if available
        if (errorData.errors) {
          console.error('Detailed validation errors:', errorData.errors)
        }
        if (errorData.issues) {
          console.error('Validation issues:', errorData.issues)
        }
        
        throw new Error(`Failed to create product: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        return { success: true, data: data.data }
      } else {
        throw new Error(data.message || 'Failed to create product')
      }
    } catch (err) {
      console.error('Error creating product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = async (formData: ProductFormData, primaryImageUrl?: string, uploadedImages?: Array<{ url: string; originalName: string; filename: string; size: number; type: string }>) => {
    return createProduct({ ...formData, isDraft: true }, primaryImageUrl, uploadedImages)
  }

  const publishProduct = async (formData: ProductFormData, primaryImageUrl?: string, uploadedImages?: Array<{ url: string; originalName: string; filename: string; size: number; type: string }>) => {
    return createProduct({ ...formData, isDraft: false }, primaryImageUrl, uploadedImages)
  }

  return {
    createProduct,
    saveDraft,
    publishProduct,
    saving,
    error
  }
}

// Combined hook for the entire add product form
export function useAddProductForm() {
  const categories = useCategories()
  const imageUpload = useImageUpload()
  const productManagement = useProductManagement()

  return {
    categories,
    imageUpload,
    productManagement
  }
} 