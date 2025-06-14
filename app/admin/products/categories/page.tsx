'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  TagIcon,
  ArrowLeftIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useCategories } from '../../../hooks/useAdminProducts'
import { useNotifications } from '../../../contexts/NotificationContext'
import Link from 'next/link'

interface Category {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  productCount?: number
}

interface CategoryFormData {
  name: string
  nameSwahili: string
  description: string
}

export default function CategoriesPage() {
  const { language } = useLanguage()
  const { showSuccess, showError } = useNotifications()
  const { categories, loading, error, refetch, createCategory, updateCategory, deleteCategory } = useCategories()
  
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    nameSwahili: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Categories Management",
      pageSubtitle: "Organize your products with categories",
      backToProducts: "Back to Products",
      addCategory: "Add Category",
      searchCategories: "Search categories...",
      
      // Table headers
      categoryName: "Category Name",
      products: "Products",
      description: "Description",
      actions: "Actions",
      
      // Form fields
      categoryNameEn: "Category Name (English)",
      categoryNameSw: "Category Name (Swahili)",
      categoryDescription: "Description (Optional)",
      
      // Modal titles
      addNewCategory: "Add New Category",
      editCategory: "Edit Category",
      deleteCategory: "Delete Category",
      
      // Actions
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      create: "Create",
      update: "Update",
      
      // Messages
      confirmDelete: "Are you sure you want to delete this category?",
      deleteWarning: "This will also remove this category from all products. This action cannot be undone.",
      emptyState: "No categories found",
      emptyStateDesc: "Start by creating your first product category",
      loading: "Loading categories...",
      
      // Validation
      nameRequired: "Category name is required",
      nameMinLength: "Category name must be at least 2 characters",
      
      // Success messages
      categoryCreated: "Category created successfully",
      categoryUpdated: "Category updated successfully",
      categoryDeleted: "Category deleted successfully"
    },
    sw: {
      pageTitle: "Usimamizi wa Makundi",
      pageSubtitle: "Panga bidhaa zako kwa makundi",
      backToProducts: "Rudi kwenye Bidhaa",
      addCategory: "Ongeza Kundi",
      searchCategories: "Tafuta makundi...",
      
      // Table headers
      categoryName: "Jina la Kundi",
      products: "Bidhaa",
      description: "Maelezo",
      actions: "Vitendo",
      
      // Form fields
      categoryNameEn: "Jina la Kundi (Kiingereza)",
      categoryNameSw: "Jina la Kundi (Kiswahili)",
      categoryDescription: "Maelezo (Si lazima)",
      
      // Modal titles
      addNewCategory: "Ongeza Kundi Jipya",
      editCategory: "Hariri Kundi",
      deleteCategory: "Futa Kundi",
      
      // Actions
      edit: "Hariri",
      delete: "Futa",
      save: "Hifadhi",
      cancel: "Ghairi",
      create: "Unda",
      update: "Sasisha",
      
      // Messages
      confirmDelete: "Una uhakika unataka kufuta kundi hili?",
      deleteWarning: "Hii pia itaondoa kundi hili kutoka bidhaa zote. Kitendo hiki hakiwezi kurudishwa.",
      emptyState: "Hakuna makundi yaliyopatikana",
      emptyStateDesc: "Anza kwa kuunda kundi lako la kwanza la bidhaa",
      loading: "Inapakia makundi...",
      
      // Validation
      nameRequired: "Jina la kundi linahitajika",
      nameMinLength: "Jina la kundi lazima liwe na angalau herufi 2",
      
      // Success messages
      categoryCreated: "Kundi limeundwa kwa mafanikio",
      categoryUpdated: "Kundi limesasishwa kwa mafanikio",
      categoryDeleted: "Kundi limefutwa kwa mafanikio"
    }
  }

  const t = translations[language]

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.nameSwahili && category.nameSwahili.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  const resetForm = () => {
    setFormData({ name: '', nameSwahili: '', description: '' })
    setEditingCategory(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      nameSwahili: category.nameSwahili || '',
      description: category.description || ''
    })
    setEditingCategory(category)
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      showError(t.nameRequired, '')
      return
    }
    
    if (formData.name.trim().length < 2) {
      showError(t.nameMinLength, '')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          nameSwahili: formData.nameSwahili.trim() || undefined,
          description: formData.description.trim() || undefined
        })

        if (result.success) {
          showSuccess(t.categoryUpdated, '')
          closeModal()
          refetch()
        } else {
          showError(result.error || 'Failed to update category', '')
        }
      } else {
        const result = await createCategory({
          name: formData.name.trim(),
          nameSwahili: formData.nameSwahili.trim() || undefined,
          description: formData.description.trim() || undefined
        })

        if (result.success) {
          showSuccess(t.categoryCreated, '')
          closeModal()
          refetch()
        } else {
          showError(result.error || 'Failed to create category', '')
        }
      }
    } catch {
      showError('An error occurred', '')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (window.confirm(`${t.confirmDelete}\n\n${t.deleteWarning}`)) {
      const result = await deleteCategory(category.id)
      if (result.success) {
        showSuccess(t.categoryDeleted, '')
        refetch()
      } else {
        showError(result.error || 'Failed to delete category', '')
      }
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
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link 
                href="/admin/products"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>{t.backToProducts}</span>
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.pageTitle}</h2>
            <p className="text-gray-600">{t.pageSubtitle}</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t.addCategory}</span>
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchCategories}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </motion.div>

      {/* Categories Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-gray-600">{t.loading}</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error: {error}</p>
              <button 
                onClick={refetch}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.emptyState}</h3>
            <p className="text-gray-600 mb-4">{t.emptyStateDesc}</p>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t.addCategory}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.categoryName}</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">{t.description}</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-800">{t.products}</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-800">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <TagIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{category.name}</p>
                          {category.nameSwahili && (
                            <p className="text-sm text-gray-500">{category.nameSwahili}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 max-w-xs truncate">
                        {category.description || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.productCount}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.edit}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t.delete}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingCategory ? t.editCategory : t.addNewCategory}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.categoryNameEn} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    placeholder="Electronics, Clothing, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.categoryNameSw}
                  </label>
                  <input
                    type="text"
                    value={formData.nameSwahili}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameSwahili: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                    placeholder="Vifaa vya Umeme, Nguo, nk."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.categoryDescription}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white resize-none"
                    placeholder="Brief description of this category..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>
                      {isSubmitting ? 'Saving...' : editingCategory ? t.update : t.create}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>{t.cancel}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
} 