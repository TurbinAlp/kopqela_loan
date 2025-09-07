'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  CalendarIcon,
  FunnelIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import PermissionGate from '../../components/auth/PermissionGate'

function ReportsAnalyticsPageContent() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('sales')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [selectedReport, setSelectedReport] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReportPreview, setShowReportPreview] = useState(false)
  const [reportData, setReportData] = useState<{
    type: string
    data: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
    summary: any // eslint-disable-line @typescript-eslint/no-explicit-any
  } | null>(null)
  const [reportParams, setReportParams] = useState({
    customerFilter: 'all',
    productCategory: 'all',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: '',
    includeDetails: true
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const translations = {
    en: {
      pageTitle: "Reports & Analytics",
      pageSubtitle: "Generate detailed reports and analyze business performance",
      
      // Tabs
      salesReports: "Sales Reports",
      debtReports: "Debt Reports", 
      inventoryReports: "Inventory Reports",
      analytics: "Analytics",
      
      // Date Range
      dateRange: "Date Range",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      thisYear: "This Year",
      lastYear: "Last Year",
      custom: "Custom Range",
      from: "From",
      to: "To",
      
      // Sales Reports
      dailySales: "Daily Sales Report",
      weeklySales: "Weekly Sales Report",
      monthlySales: "Monthly Sales Report",
      customSales: "Custom Sales Report",
      salesSummary: "Sales Summary",
      totalSales: "Total Sales",
      totalOrders: "Total Orders",
      averageOrder: "Average Order Value",
      salesGrowth: "Sales Growth",
      
      // Debt Reports
      outstandingDebts: "Outstanding Debts",
      overduePayments: "Overdue Payments",
      collectionReport: "Collection Report",
      badDebtAnalysis: "Bad Debt Analysis",
      totalOutstanding: "Total Outstanding",
      overdueAmount: "Overdue Amount",
      collectionRate: "Collection Rate",
      riskAssessment: "Risk Assessment",
      
      // Inventory Reports
      lowStockReport: "Low Stock Report",
      stockMovement: "Stock Movement",
      productPerformance: "Product Performance",
      valuationReport: "Valuation Report",
      lowStockItems: "Low Stock Items",
      fastMoving: "Fast Moving Items",
      slowMoving: "Slow Moving Items",
      totalValue: "Total Inventory Value",
      
      // Export Options
      exportOptions: "Export Options",
      exportPDF: "Export PDF",
      exportExcel: "Export Excel",
      exportCSV: "Export CSV",
      printReport: "Print Report",
      generateReport: "Generate Report",
      downloading: "Downloading...",
      
      // Actions
      filter: "Filter",
      reset: "Reset",
      view: "View",
      download: "Download",
      print: "Print",
      
      // Status
      generating: "Generating report...",
      ready: "Report ready",
      error: "Error generating report",
      noData: "No data available for selected period",
      
      // Quick Stats
      todayStats: "Today's Stats",
      thisMonthStats: "This Month Stats",
      performance: "Performance",
      trends: "Trends"
    },
    sw: {
      pageTitle: "Ripoti na Uchambuzi",
      pageSubtitle: "Tengeneza ripoti za kina na chambua utendaji wa biashara",
      
      // Tabs
      salesReports: "Ripoti za Mauzo",
      debtReports: "Ripoti za Madeni",
      inventoryReports: "Ripoti za Hifadhi",
      analytics: "Uchambuzi",
      
      // Date Range
      dateRange: "Muda wa Tarehe",
      today: "Leo",
      yesterday: "Jana",
      thisWeek: "Wiki Hii",
      lastWeek: "Wiki Iliyopita",
      thisMonth: "Mwezi Huu",
      lastMonth: "Mwezi Uliopita",
      thisYear: "Mwaka Huu",
      lastYear: "Mwaka Uliopita",
      custom: "Muda Maalum",
      from: "Kutoka",
      to: "Hadi",
      
      // Sales Reports
      dailySales: "Ripoti ya Mauzo ya Kila Siku",
      weeklySales: "Ripoti ya Mauzo ya Kila Wiki",
      monthlySales: "Ripoti ya Mauzo ya Kila Mwezi",
      customSales: "Ripoti ya Mauzo Maalum",
      salesSummary: "Muhtasari wa Mauzo",
      totalSales: "Jumla ya Mauzo",
      totalOrders: "Jumla ya Maagizo",
      averageOrder: "Wastani wa Agizo",
      salesGrowth: "Ukuaji wa Mauzo",
      
      // Debt Reports
      outstandingDebts: "Madeni Yasiyolipwa",
      overduePayments: "Malipo Yaliyochelewa",
      collectionReport: "Ripoti ya Ukusanyaji",
      badDebtAnalysis: "Uchambuzi wa Madeni Mabaya",
      totalOutstanding: "Jumla ya Madeni",
      overdueAmount: "Kiasi Kilichochelewa",
      collectionRate: "Kiwango cha Ukusanyaji",
      riskAssessment: "Tathmini ya Hatari",
      
      // Inventory Reports
      lowStockReport: "Ripoti ya Hisa Ndogo",
      stockMovement: "Mwendo wa Hisa",
      productPerformance: "Utendaji wa Bidhaa",
      valuationReport: "Ripoti ya Thamani",
      lowStockItems: "Bidhaa za Hisa Ndogo",
      fastMoving: "Bidhaa Zinazoenda Haraka",
      slowMoving: "Bidhaa Zinazoenda Pole",
      totalValue: "Jumla ya Thamani ya Hifadhi",
      
      // Export Options
      exportOptions: "Chaguo za Kuhamisha",
      exportPDF: "Hamisha PDF",
      exportExcel: "Hamisha Excel",
      exportCSV: "Hamisha CSV",
      printReport: "Chapisha Ripoti",
      generateReport: "Tengeneza Ripoti",
      downloading: "Inapakua...",
      
      // Actions
      filter: "Chuja",
      reset: "Rudisha",
      view: "Ona",
      download: "Pakua",
      print: "Chapisha",
      
      // Status
      generating: "Inaengeneza ripoti...",
      ready: "Ripoti iko tayari",
      error: "Hitilafu katika kutengeneza ripoti",
      noData: "Hakuna data ya muda uliochagua",
      
      // Quick Stats
      todayStats: "Takwimu za Leo",
      thisMonthStats: "Takwimu za Mwezi Huu",
      performance: "Utendaji",
      trends: "Mienendo"
    }
  }

  const t = translations[language]

  // Sample data - replace with real API data
  const salesData = {
    totalSales: 15750000,
    totalOrders: 234,
    averageOrder: 67307,
    salesGrowth: 12.5
  }

  const debtData = {
    totalOutstanding: 8450000,
    overdueAmount: 2100000,
    collectionRate: 78.5,
    riskLevel: 'medium'
  }

  const inventoryData = {
    lowStockItems: 23,
    totalValue: 45000000,
    fastMovingItems: 67,
    slowMovingItems: 34
  }

  // Sample report data
  const sampleSalesData = [
    { id: 1, date: '2024-01-15', orderNumber: 'ORD-001', customer: 'Maria Mwangi', amount: 150000, items: 3, paymentMethod: 'Mobile Money', status: 'Completed' },
    { id: 2, date: '2024-01-15', orderNumber: 'ORD-002', customer: 'John Kimani', amount: 75000, items: 2, paymentMethod: 'Cash', status: 'Pending' },
    { id: 3, date: '2024-01-14', orderNumber: 'ORD-003', customer: 'Grace Moshi', amount: 200000, items: 5, paymentMethod: 'Bank Transfer', status: 'Completed' },
    { id: 4, date: '2024-01-14', orderNumber: 'ORD-004', customer: 'Peter Mlay', amount: 125000, items: 4, paymentMethod: 'Credit', status: 'Processing' }
  ]

  const sampleDebtData = [
    { id: 1, customer: 'Alice Nyong\'o', totalDebt: 450000, overdue: 150000, lastPayment: '2024-01-10', dueDate: '2024-01-20', status: 'Overdue' },
    { id: 2, customer: 'James Ouma', totalDebt: 300000, overdue: 0, lastPayment: '2024-01-12', dueDate: '2024-02-15', status: 'Current' },
    { id: 3, customer: 'Sarah Njeri', totalDebt: 680000, overdue: 200000, lastPayment: '2024-01-05', dueDate: '2024-01-18', status: 'Overdue' },
    { id: 4, customer: 'David Kiprop', totalDebt: 250000, overdue: 0, lastPayment: '2024-01-13', dueDate: '2024-02-10', status: 'Current' }
  ]

  const sampleInventoryData = [
    { id: 1, product: 'Premium Fertilizer NPK', category: 'Fertilizers', currentStock: 15, minStock: 20, value: 1275000, movement: 'Slow', status: 'Low Stock' },
    { id: 2, product: 'Maize Seeds - Hybrid', category: 'Seeds', currentStock: 180, minStock: 50, value: 2160000, movement: 'Fast', status: 'In Stock' },
    { id: 3, product: 'Solar Panel 300W', category: 'Electronics', currentStock: 8, minStock: 10, value: 2000000, movement: 'Medium', status: 'Low Stock' },
    { id: 4, product: 'Cooking Gas Cylinder', category: 'Gas Equipment', currentStock: 75, minStock: 20, value: 3375000, movement: 'Fast', status: 'In Stock' }
  ]

  const dateRangeOptions = [
    { value: 'today', label: t.today },
    { value: 'yesterday', label: t.yesterday },
    { value: 'thisWeek', label: t.thisWeek },
    { value: 'lastWeek', label: t.lastWeek },
    { value: 'thisMonth', label: t.thisMonth },
    { value: 'lastMonth', label: t.lastMonth },
    { value: 'thisYear', label: t.thisYear },
    { value: 'lastYear', label: t.lastYear },
    { value: 'custom', label: t.custom }
  ]

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true)
    setSelectedReport(reportType)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate actual report data based on type
    let data: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
    let summary: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
    
    switch (reportType) {
      case 'daily-sales':
      case 'weekly-sales': 
      case 'monthly-sales':
      case 'custom-sales':
        data = sampleSalesData.filter(item => {
          if (reportParams.customerFilter !== 'all') return false
          if (reportParams.minAmount && item.amount < parseInt(reportParams.minAmount)) return false
          if (reportParams.maxAmount && item.amount > parseInt(reportParams.maxAmount)) return false
          return true
        })
        summary = {
          totalAmount: data.reduce((sum, item) => sum + item.amount, 0),
          totalOrders: data.length,
          averageOrder: data.length ? data.reduce((sum, item) => sum + item.amount, 0) / data.length : 0
        }
        break
        
      case 'outstanding-debts':
      case 'overdue-payments':
      case 'collection-report':
      case 'bad-debt-analysis':
        data = sampleDebtData
        summary = {
          totalDebt: data.reduce((sum, item) => sum + item.totalDebt, 0),
          totalOverdue: data.reduce((sum, item) => sum + item.overdue, 0),
          customersCount: data.length
        }
        break
        
      case 'low-stock':
      case 'stock-movement':
      case 'product-performance':
      case 'valuation-report':
        data = sampleInventoryData
        summary = {
          totalValue: data.reduce((sum, item) => sum + item.value, 0),
          lowStockCount: data.filter(item => item.status === 'Low Stock').length,
          totalProducts: data.length
        }
        break
    }
    
    setReportData({ type: reportType, data, summary })
    setShowReportPreview(true)
    setIsGenerating(false)
    setSelectedReport('')
  }

  const handleParamChange = (param: string, value: string | boolean) => {
    setReportParams(prev => ({
      ...prev,
      [param]: value
    }))
  }

  const handleExport = async (format: string) => {
    setIsGenerating(true)
    
    // Simulate export based on format
    console.log(`Exporting in ${format} format`)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsGenerating(false)
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

  interface StatCardProps {
    title: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    trend?: number
    color?: string
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = "teal" }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  interface ReportCardProps {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    onClick: (reportType: string) => void
    reportType: string
  }

  const ReportCard = ({ title, description, icon: Icon, onClick, reportType }: ReportCardProps) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(reportType)}
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-lg bg-teal-100">
          <Icon className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleExport('pdf')
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={t.exportPDF}
          >
            <DocumentTextIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleExport('excel')
            }}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title={t.exportExcel}
          >
            <TableCellsIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.print()
            }}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title={t.printReport}
          >
            <PrinterIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {isGenerating && selectedReport === reportType && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
          <span className="text-sm text-teal-600">{t.generating}</span>
        </div>
      )}
    </motion.div>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
              <p className="text-gray-600">{t.pageSubtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {dateRange === 'custom' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                  <span className="text-gray-500 text-sm hidden sm:inline">{t.to}</span>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-full mx-auto">
        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-2 sm:px-0">
                {[
                  { id: 'sales', label: t.salesReports, icon: ChartBarIcon },
                  { id: 'debt', label: t.debtReports, icon: CurrencyDollarIcon },
                  { id: 'inventory', label: t.inventoryReports, icon: CubeIcon },
                  { id: 'analytics', label: t.analytics, icon: ArrowTrendingUpIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
            </div>
          </div>
        </motion.div>

        {/* Sales Reports Tab */}
        {activeTab === 'sales' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title={t.totalSales}
                value={`TSh ${salesData.totalSales.toLocaleString()}`}
                icon={BanknotesIcon}
                trend={salesData.salesGrowth}
                color="teal"
              />
              <StatCard
                title={t.totalOrders}
                value={salesData.totalOrders.toLocaleString()}
                icon={ChartBarIcon}
                trend={8.2}
                color="blue"
              />
              <StatCard
                title={t.averageOrder}
                value={`TSh ${salesData.averageOrder.toLocaleString()}`}
                icon={CurrencyDollarIcon}
                trend={-2.1}
                color="green"
              />
              <StatCard
                title={t.salesGrowth}
                value={`${salesData.salesGrowth}%`}
                icon={ArrowTrendingUpIcon}
                trend={salesData.salesGrowth}
                color="purple"
              />
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportCard
                title={t.dailySales}
                description="Detailed breakdown of daily sales performance"
                icon={CalendarIcon}
                onClick={handleGenerateReport}
                reportType="daily-sales"
              />
              <ReportCard
                title={t.weeklySales}
                description="Weekly sales trends and comparisons"
                icon={ChartBarIcon}
                onClick={handleGenerateReport}
                reportType="weekly-sales"
              />
              <ReportCard
                title={t.monthlySales}
                description="Monthly sales analysis and forecasting"
                icon={ArrowTrendingUpIcon}
                onClick={handleGenerateReport}
                reportType="monthly-sales"
              />
              <ReportCard
                title={t.customSales}
                description="Custom date range sales analysis"
                icon={FunnelIcon}
                onClick={handleGenerateReport}
                reportType="custom-sales"
              />
            </div>
          </motion.div>
        )}

        {/* Debt Reports Tab */}
        {activeTab === 'debt' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title={t.totalOutstanding}
                value={`TSh ${debtData.totalOutstanding.toLocaleString()}`}
                icon={CurrencyDollarIcon}
                color="red"
              />
              <StatCard
                title={t.overdueAmount}
                value={`TSh ${debtData.overdueAmount.toLocaleString()}`}
                icon={ExclamationTriangleIcon}
                color="orange"
              />
              <StatCard
                title={t.collectionRate}
                value={`${debtData.collectionRate}%`}
                icon={ArrowTrendingUpIcon}
                trend={5.3}
                color="blue"
              />
              <StatCard
                title={t.riskAssessment}
                value="Medium"
                icon={ClockIcon}
                color="yellow"
              />
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportCard
                title={t.outstandingDebts}
                description="Complete list of all outstanding customer debts"
                icon={CurrencyDollarIcon}
                onClick={handleGenerateReport}
                reportType="outstanding-debts"
              />
              <ReportCard
                title={t.overduePayments}
                description="Payments that are past their due date"
                icon={ExclamationTriangleIcon}
                onClick={handleGenerateReport}
                reportType="overdue-payments"
              />
              <ReportCard
                title={t.collectionReport}
                description="Collection performance and recovery rates"
                icon={ArrowTrendingUpIcon}
                onClick={handleGenerateReport}
                reportType="collection-report"
              />
              <ReportCard
                title={t.badDebtAnalysis}
                description="Analysis of bad debts and write-offs"
                icon={ChartBarIcon}
                onClick={handleGenerateReport}
                reportType="bad-debt-analysis"
              />
            </div>
          </motion.div>
        )}

        {/* Inventory Reports Tab */}
        {activeTab === 'inventory' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title={t.lowStockItems}
                value={inventoryData.lowStockItems.toString()}
                icon={ExclamationTriangleIcon}
                color="red"
              />
              <StatCard
                title={t.totalValue}
                value={`TSh ${inventoryData.totalValue.toLocaleString()}`}
                icon={BanknotesIcon}
                color="green"
              />
              <StatCard
                title={t.fastMoving}
                value={inventoryData.fastMovingItems.toString()}
                icon={ArrowTrendingUpIcon}
                color="blue"
              />
              <StatCard
                title={t.slowMoving}
                value={inventoryData.slowMovingItems.toString()}
                icon={ArrowTrendingDownIcon}
                color="orange"
              />
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportCard
                title={t.lowStockReport}
                description="Items running low on stock that need restocking"
                icon={ExclamationTriangleIcon}
                onClick={handleGenerateReport}
                reportType="low-stock"
              />
              <ReportCard
                title={t.stockMovement}
                description="Track inventory movement and turnover rates"
                icon={CubeIcon}
                onClick={handleGenerateReport}
                reportType="stock-movement"
              />
              <ReportCard
                title={t.productPerformance}
                description="Best and worst performing products analysis"
                icon={ChartBarIcon}
                onClick={handleGenerateReport}
                reportType="product-performance"
              />
              <ReportCard
                title={t.valuationReport}
                description="Current inventory valuation and cost analysis"
                icon={BanknotesIcon}
                onClick={handleGenerateReport}
                reportType="valuation-report"
              />
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Analytics Dashboard</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">{t.performance}</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Sales Performance Chart</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">{t.trends}</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Trend Analysis Chart</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Export Section */}
        <motion.div variants={itemVariants} className="mt-8 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.exportOptions}</h3>
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{isGenerating ? t.downloading : t.exportPDF}</span>
                <span className="sm:hidden">PDF</span>
              </button>
              
              <button
                onClick={() => handleExport('excel')}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <TableCellsIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{isGenerating ? t.downloading : t.exportExcel}</span>
                <span className="sm:hidden">Excel</span>
              </button>
              
              <button
                onClick={() => handleExport('csv')}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{isGenerating ? t.downloading : t.exportCSV}</span>
                <span className="sm:hidden">CSV</span>
              </button>
              
              <button
                onClick={() => window.print()}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <PrinterIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t.printReport}</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Report Preview Section */}
        {showReportPreview && reportData && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Report Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reportData.type === 'daily-sales' && t.dailySales}
                    {reportData.type === 'weekly-sales' && t.weeklySales}
                    {reportData.type === 'monthly-sales' && t.monthlySales}
                    {reportData.type === 'outstanding-debts' && t.outstandingDebts}
                    {reportData.type === 'low-stock' && t.lowStockReport}
                    {!['daily-sales', 'weekly-sales', 'monthly-sales', 'outstanding-debts', 'low-stock'].includes(reportData.type) && 'Report'}
                  </h3>
                  <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setShowReportPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Report Summary */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportData.type.includes('sales') && (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-teal-600">TSh {reportData.summary.totalAmount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalOrders}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">TSh {Math.round(reportData.summary.averageOrder)?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Average Order</p>
                      </div>
                    </>
                  )}
                  {reportData.type.includes('debt') && (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">TSh {reportData.summary.totalDebt?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Debt</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">TSh {reportData.summary.totalOverdue?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Overdue Amount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{reportData.summary.customersCount}</p>
                        <p className="text-sm text-gray-600">Customers</p>
                      </div>
                    </>
                  )}
                  {reportData.type.includes('stock') || reportData.type.includes('inventory') || reportData.type === 'valuation-report' && (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">TSh {reportData.summary.totalValue?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Value</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{reportData.summary.lowStockCount}</p>
                        <p className="text-sm text-gray-600">Low Stock Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalProducts}</p>
                        <p className="text-sm text-gray-600">Total Products</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Report Data Table */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {reportData.type.includes('sales') && (
                          <>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Order</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          </>
                        )}
                        {reportData.type.includes('debt') && (
                          <>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Debt</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Overdue</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          </>
                        )}
                        {(reportData.type.includes('stock') || reportData.type.includes('inventory') || reportData.type === 'valuation-report') && (
                          <>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          {reportData.type.includes('sales') && (
                            <>
                              <td className="py-3 px-4 text-gray-900">{item.date}</td>
                              <td className="py-3 px-4 text-gray-900">{item.orderNumber}</td>
                              <td className="py-3 px-4 text-gray-900">{item.customer}</td>
                              <td className="py-3 px-4 text-gray-900">TSh {item.amount?.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                          {reportData.type.includes('debt') && (
                            <>
                              <td className="py-3 px-4 text-gray-900">{item.customer}</td>
                              <td className="py-3 px-4 text-gray-900">TSh {item.totalDebt?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-gray-900">TSh {item.overdue?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-gray-900">{item.dueDate}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                          {(reportData.type.includes('stock') || reportData.type.includes('inventory') || reportData.type === 'valuation-report') && (
                            <>
                              <td className="py-3 px-4 text-gray-900">{item.product}</td>
                              <td className="py-3 px-4 text-gray-900">{item.category}</td>
                              <td className="py-3 px-4 text-gray-900">{item.currentStock}/{item.minStock}</td>
                              <td className="py-3 px-4 text-gray-900">TSh {item.value?.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'Low Stock' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Report Parameters */}
        {(activeTab === 'sales' || activeTab === 'debt') && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Filter</label>
                  <select
                    value={reportParams.customerFilter}
                    onChange={(e) => handleParamChange('customerFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  >
                    <option value="all">All Customers</option>
                    <option value="active">Active Customers</option>
                    <option value="new">New Customers</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={reportParams.minAmount}
                    onChange={(e) => handleParamChange('minAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={reportParams.maxAmount}
                    onChange={(e) => handleParamChange('maxAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    placeholder="1000000"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportParams.includeDetails}
                    onChange={(e) => handleParamChange('includeDetails', e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Include detailed breakdown</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function ReportsAnalyticsPage() {
  return (
    <PermissionGate requiredPermission="reports.read">
      <ReportsAnalyticsPageContent />
    </PermissionGate>
  )
} 