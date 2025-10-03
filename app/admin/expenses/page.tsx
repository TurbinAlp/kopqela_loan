'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  CreditCardIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useBusiness } from '../../contexts/BusinessContext'
import PermissionGate from '../../components/auth/PermissionGate'
import AddExpenseModal from '../../components/admin/expenses/AddExpenseModal'
import EditExpenseModal from '../../components/admin/expenses/EditExpenseModal'
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal'
import { useSession } from 'next-auth/react'
import { hasPermissionSync, useBusinessPermissions } from '../../hooks/usePermissions'

interface Expense {
  id: number
  expenseNumber: string
  amount: number
  title: string
  description?: string
  expenseDate: string
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  receipt?: string
  reference?: string
  vendorName?: string
  vendorContact?: string
  isRecurring: boolean
  recurringType?: string
  nextDueDate?: string
  categoryId?: number
  createdAt: string
  updatedAt: string
  category?: {
    id: number
    name: string
    nameSwahili?: string
    color?: string
  }
  createdBy?: {
    id: number
    firstName: string
    lastName: string
  }
}

interface ExpenseFilters {
  search: string
  paymentMethod: string
  status: string
  categoryId: string
  dateFrom: string
  dateTo: string
  isRecurring: string
}

function ExpensesPageContent() {
  const { language } = useLanguage()
  const { showError, showSuccess } = useNotifications()
  const { currentBusiness } = useBusiness()
  const { data: session } = useSession()
  const { permissions: businessPermissions } = useBusinessPermissions(currentBusiness?.id)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    expenseId: null as number | null,
    expenseName: ''
  })
  const itemsPerPage = 20

  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    paymentMethod: 'all',
    status: 'all',
    categoryId: 'all',
    dateFrom: '',
    dateTo: '',
    isRecurring: 'all'
  })

  const translations = {
    en: {
      title: 'Expenses',
      subtitle: 'Manage business expenses and payments',
      addExpense: 'Add Expense',
      searchPlaceholder: 'Search expenses...',
      filters: 'Filters',
      noExpenses: 'No expenses found',
      noExpensesDescription: 'No expense records match your current filters.',
      expenseNumber: 'Expense #',
      amount: 'Amount',
      expenseTitle: 'Title',
      description: 'Description',
      expenseDate: 'Date',
      paymentMethod: 'Payment Method',
      status: 'Status',
      category: 'Category',
      vendor: 'Vendor',
      recurring: 'Recurring',
      actions: 'Actions',
      
      // Payment Methods
      cash: 'Cash',
      card: 'Card',
      mobileMoney: 'Mobile Money',
      bankTransfer: 'Bank Transfer',
      cheque: 'Cheque',
      credit: 'Credit',
      
      // Status
      pending: 'Pending',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      
      // Actions
      viewExpense: 'View expense details',
      editExpense: 'Edit expense',
      deleteExpense: 'Delete expense',
      
      // Filters
      allMethods: 'All Methods',
      allStatuses: 'All Statuses',
      allCategories: 'All Categories',
      dateFrom: 'From Date',
      dateTo: 'To Date',
      clearFilters: 'Clear Filters',
      applyFilters: 'Apply Filters',
      recurringExpenses: 'Recurring',
      oneTimeExpenses: 'One-time',
      allExpenses: 'All',
      
      // Pagination
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      showing: 'Showing',
      results: 'results',
      
      // Messages
      expenseAdded: 'Expense added successfully',
      expenseUpdated: 'Expense updated successfully',
      expenseDeleted: 'Expense deleted successfully',
      errorLoading: 'Failed to load expenses',
      errorAdding: 'Failed to add expense',
      errorUpdating: 'Failed to update expense',
      errorDeleting: 'Failed to delete expense',
      deleteExpenseTitle: 'Delete Expense',
      deleteConfirmMessage: 'Are you sure you want to delete this expense? This action cannot be undone.',
      
      // Summary
      totalAmount: 'Total Amount',
      totalExpenses: 'Total Expenses',
      monthlyTotal: 'This Month',
      pendingAmount: 'Pending Amount',
      currency: 'TZS',
      
      // Recurring
      yes: 'Yes',
      no: 'No'
    },
    sw: {
      title: 'Gharama',
      subtitle: 'Simamia gharama za biashara na malipo',
      addExpense: 'Ongeza Gharama',
      searchPlaceholder: 'Tafuta gharama...',
      filters: 'Vichungi',
      noExpenses: 'Hakuna gharama zilizopatikana',
      noExpensesDescription: 'Hakuna rekodi za gharama zinazolingana na vichungi vyako.',
      expenseNumber: 'Gharama #',
      amount: 'Kiasi',
      expenseTitle: 'Kichwa',
      description: 'Maelezo',
      expenseDate: 'Tarehe',
      paymentMethod: 'Njia ya Malipo',
      status: 'Hali',
      category: 'Kundi',
      vendor: 'Muuzaji',
      recurring: 'Inarudiwa',
      actions: 'Vitendo',
      
      // Payment Methods
      cash: 'Fedha Taslimu',
      card: 'Kadi',
      mobileMoney: 'Fedha za Simu',
      bankTransfer: 'Uhamisho wa Benki',
      cheque: 'Hundi',
      credit: 'Mkopo',
      
      // Status
      pending: 'Inasubiri',
      paid: 'Imelipwa',
      overdue: 'Imechelewa',
      cancelled: 'Imeghairiwa',
      
      // Actions
      viewExpense: 'Ona maelezo ya gharama',
      editExpense: 'Hariri gharama',
      deleteExpense: 'Futa gharama',
      
      // Filters
      allMethods: 'Njia Zote',
      allStatuses: 'Hali Zote',
      allCategories: 'Makundi Yote',
      dateFrom: 'Kutoka Tarehe',
      dateTo: 'Hadi Tarehe',
      clearFilters: 'Futa Vichungi',
      applyFilters: 'Tumia Vichungi',
      recurringExpenses: 'Zinarudiwa',
      oneTimeExpenses: 'Mara moja',
      allExpenses: 'Zote',
      
      // Pagination
      page: 'Ukurasa',
      of: 'wa',
      previous: 'Iliyotangulia',
      next: 'Ifuatayo',
      showing: 'Inaonyesha',
      results: 'matokeo',
      
      // Messages
      expenseAdded: 'Matumizi yameongezwa kikamilifu',
      expenseUpdated: 'Matumizi yamebadilishwa kikamilifu',
      expenseDeleted: 'Matumizi yamefutwa kikamilifu',
      errorLoading: 'Imeshindwa kupakia matumizi',
      errorAdding: 'Imeshindwa kuongeza matumizi',
      errorUpdating: 'Imeshindwa kubadilisha matumizi',
      errorDeleting: 'Imeshindwa kufuta matumizi',
      deleteExpenseTitle: 'Futa Matumizi',
      deleteConfirmMessage: 'Una uhakika unataka kufuta gharama hii? Hatua hii haiwezi kubatilishwa.',
      
      // Summary
      totalAmount: 'Jumla ya Kiasi',
      totalExpenses: 'Jumla ya Matumizi',
      monthlyTotal: 'Mwezi Huu',
      pendingAmount: 'Kiasi Kinachosubiri',
      currency: 'TSh',
      
      // Recurring
      yes: 'Ndio',
      no: 'Hapana'
    }
  }

  const t = translations[language]

  const loadExpenses = useCallback(async () => {
    if (!currentBusiness?.id) return

    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        businessId: currentBusiness.id.toString(),
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value && value !== 'all')
        )
      })

      const response = await fetch(`/api/admin/expenses?${params}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setExpenses(result.data.expenses)
        setTotalPages(result.data.pagination.totalPages)
        setTotalExpenses(result.data.pagination.total)
      } else {
        throw new Error(result.message || t.errorLoading)
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      showError(t.title, error instanceof Error ? error.message : t.errorLoading)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness?.id, currentPage, filters, showError, t.title, t.errorLoading])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const handleFilterChange = (key: keyof ExpenseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      paymentMethod: 'all',
      status: 'all',
      categoryId: 'all',
      dateFrom: '',
      dateTo: '',
      isRecurring: 'all'
    })
    setCurrentPage(1)
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowEditModal(true)
  }

  const handleDeleteClick = (expenseId: number, expenseName: string) => {
    setDeleteModal({
      isOpen: true,
      expenseId,
      expenseName
    })
  }

  const handleDeleteClose = () => {
    setDeleteModal({
      isOpen: false,
      expenseId: null,
      expenseName: ''
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.expenseId) return

    try {
      const response = await fetch(`/api/admin/expenses/${deleteModal.expenseId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setExpenses(prev => prev.filter(expense => expense.id !== deleteModal.expenseId))
        showSuccess(t.title, t.expenseDeleted)
        handleDeleteClose()
      } else {
        throw new Error(result.message || t.errorDeleting)
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      showError(t.title, error instanceof Error ? error.message : t.errorDeleting)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <BanknotesIcon className="w-4 h-4" />
      case 'CARD':
        return <CreditCardIcon className="w-4 h-4" />
      case 'MOBILE_MONEY':
        return <DevicePhoneMobileIcon className="w-4 h-4" />
      case 'BANK_TRANSFER':
        return <BuildingLibraryIcon className="w-4 h-4" />
      case 'CHEQUE':
        return <CreditCardIcon className="w-4 h-4" />
      default:
        return <CreditCardIcon className="w-4 h-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return t.cash
      case 'CARD': return t.card
      case 'MOBILE_MONEY': return t.mobileMoney
      case 'BANK_TRANSFER': return t.bankTransfer
      case 'CHEQUE': return t.cheque
      case 'CREDIT': return t.credit
      default: return method
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'PENDING':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'CANCELLED':
        return <XCircleIcon className="w-4 h-4 text-gray-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return t.pending
      case 'PAID': return t.paid
      case 'OVERDUE': return t.overdue
      case 'CANCELLED': return t.cancelled
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate totals
  const currentMonthTotal = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.expenseDate)
      const currentDate = new Date()
      return expenseDate.getMonth() === currentDate.getMonth() && 
             expenseDate.getFullYear() === currentDate.getFullYear()
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const pendingTotal = expenses
    .filter(expense => expense.status === 'PENDING' || expense.status === 'OVERDUE')
    .reduce((sum, expense) => sum + expense.amount, 0)

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            {t.filters}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {t.addExpense}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <CreditCardIcon className="w-6 h-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t.totalExpenses}</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t.totalAmount}</p>
              <p className="text-2xl font-bold text-gray-900">
                {t.currency} {formatAmount(totalAmount)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t.monthlyTotal}</p>
              <p className="text-2xl font-bold text-gray-900">
                {t.currency} {formatAmount(currentMonthTotal)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t.pendingAmount}</p>
              <p className="text-2xl font-bold text-gray-900">
                {t.currency} {formatAmount(pendingTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.searchPlaceholder}
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.paymentMethod}
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">{t.allMethods}</option>
                <option value="CASH">{t.cash}</option>
                <option value="CARD">{t.card}</option>
                <option value="MOBILE_MONEY">{t.mobileMoney}</option>
                <option value="BANK_TRANSFER">{t.bankTransfer}</option>
                <option value="CHEQUE">{t.cheque}</option>
                <option value="CREDIT">{t.credit}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.status}
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="PENDING">{t.pending}</option>
                <option value="PAID">{t.paid}</option>
                <option value="OVERDUE">{t.overdue}</option>
                <option value="CANCELLED">{t.cancelled}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.recurring}
              </label>
              <select
                value={filters.isRecurring}
                onChange={(e) => handleFilterChange('isRecurring', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">{t.allExpenses}</option>
                <option value="true">{t.recurringExpenses}</option>
                <option value="false">{t.oneTimeExpenses}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.dateFrom}
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.dateTo}
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t.clearFilters}
            </button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noExpenses}</h3>
            <p className="text-gray-600 mb-6">{t.noExpensesDescription}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {t.addExpense}
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-600 border-b border-teal-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.expenseNumber}
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.expenseTitle}
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.amount}
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.category}
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.paymentMethod}
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.status}
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-white text-sm">
                      {t.expenseDate}
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-white text-sm">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.expenseNumber}
                        </div>
                        {expense.isRecurring && (
                          <div className="text-xs text-blue-600 flex items-center mt-1">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {t.recurring}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.title}
                        </div>
                        {expense.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {t.currency} {formatAmount(expense.amount)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {expense.category ? (
                          <span 
                            className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: expense.category.color ? `${expense.category.color}20` : '#f3f4f6',
                              color: expense.category.color || '#374151'
                            }}
                          >
                            {language === 'sw' && expense.category.nameSwahili 
                              ? expense.category.nameSwahili 
                              : expense.category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(expense.paymentMethod)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getPaymentMethodLabel(expense.paymentMethod)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          <span className="ml-1">{getStatusLabel(expense.status)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDate(expense.expenseDate)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title={t.viewExpense}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {hasPermissionSync(session, 'expenses.update', businessPermissions) && (
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t.editExpense}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermissionSync(session, 'expenses.delete', businessPermissions) && (
                            <button
                              onClick={() => handleDeleteClick(expense.id, expense.title)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t.deleteExpenseTitle}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t.showing} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalExpenses)} {t.of} {totalExpenses} {t.results}
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
            )}
          </>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={() => {
          loadExpenses()
          showSuccess(t.title, t.expenseAdded)
        }}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedExpense(null)
        }}
        expense={selectedExpense}
        onExpenseUpdated={() => {
          loadExpenses()
          showSuccess(t.title, t.expenseUpdated)
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title={t.deleteExpenseTitle}
        message={t.deleteConfirmMessage}
        itemName={deleteModal.expenseName}
      />
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <PermissionGate requiredPermission="expenses.read">
      <ExpensesPageContent />
    </PermissionGate>
  )
}
