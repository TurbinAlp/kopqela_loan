import * as XLSX from 'xlsx'

// Order types
interface OrderItem {
  quantity: number
  [key: string]: unknown
}

interface Customer {
  fullName?: string
  phone?: string
  [key: string]: unknown
}

interface ExcelOrder {
  orderNumber: string
  orderItems?: OrderItem[]
  customer?: Customer
  totalAmount: number | string
  status: string
  paymentStatus: string
  paymentMethod?: string
  orderDate: string | Date
  [key: string]: unknown
}

// Customer types
interface ExcelCustomer {
  name?: string
  email?: string
  phone?: string
  address?: string
  idNumber?: string
  status: string
  totalOrders: number
  totalSpent: number
  creditLimit: number
  outstandingBalance: number
  creditScore: string
  registrationDate: string
  lastOrderDate?: string
  [key: string]: unknown
}

// Product types
interface ProductCategory {
  id: number
  name: string
  nameSwahili?: string
  [key: string]: unknown
}

interface ProductInventory {
  quantity: number
  reservedQuantity?: number
  reorderPoint?: number
  maxStock?: number
  location?: string
  [key: string]: unknown
}

interface ExcelProduct {
  id: number
  name: string
  nameSwahili?: string
  description?: string
  category?: ProductCategory
  price: number
  wholesalePrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  unit?: string
  isActive: boolean
  isDraft: boolean
  inventory?: ProductInventory
  createdAt: string | Date
  updatedAt: string | Date
  [key: string]: unknown
}

// Credit Sale types
interface CreditSaleProduct {
  name: string
  category: string
  price: number
  quantity: number
  total: number
  [key: string]: unknown
}

interface ExcelCreditSale {
  id: number
  saleNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  products: CreditSaleProduct[]
  totalAmount: number
  amountPaid: number
  outstandingBalance: number
  paymentPlan: 'PARTIAL' | 'CREDIT'
  paymentMethod: string
  saleDate: string | Date
  dueDate?: string | Date
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'defaulted'
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  lastPaymentDate?: string | Date
  nextPaymentDate?: string | Date
  [key: string]: unknown
}

// Translation interface
interface Translations {
  currency: string
  [key: string]: string
}

interface ExcelExportOptions {
  data: Record<string, unknown>[]
  filename: string
  sheetName?: string
  headerStyle?: {
    backgroundColor?: string
    textColor?: string
    bold?: boolean
    borderColor?: string
  }
  columnWidths?: number[]
}

/**
 * Export data to Excel with consistent styling
 * @param options Export configuration options
 */
export const exportToExcel = ({
  data,
  filename,
  sheetName = 'Data',
  headerStyle = {
    backgroundColor: '0D9488', // Teal-600
    textColor: 'FFFFFF',       // White
    bold: true,
    borderColor: '0F766E'      // Teal-700
  },
  columnWidths
}: ExcelExportOptions) => {
  if (!data || data.length === 0) {
    console.warn('No data provided for Excel export')
    return
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Get header row letters (A1, B1, C1, etc.)
  const headers = Object.keys(data[0])
  const headerCells = headers.map((_, index) => 
    String.fromCharCode(65 + index) + '1'
  )
  
  // Set column widths if provided
  if (columnWidths && columnWidths.length > 0) {
    ws['!cols'] = columnWidths.map(width => ({ width }))
  } else {
    // Auto-size columns based on header length + buffer
    ws['!cols'] = headers.map(header => ({ 
      width: Math.max(header.length + 5, 12) 
    }))
  }
  
  // Apply header styling
  headerCells.forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = {
        fill: {
          fgColor: { rgb: headerStyle.backgroundColor }
        },
        font: {
          bold: headerStyle.bold,
          color: { rgb: headerStyle.textColor }
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        },
        border: {
          top: { style: "thin", color: { rgb: headerStyle.borderColor } },
          bottom: { style: "thin", color: { rgb: headerStyle.borderColor } },
          left: { style: "thin", color: { rgb: headerStyle.borderColor } },
          right: { style: "thin", color: { rgb: headerStyle.borderColor } }
        }
      }
    }
  })
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // Generate filename with current date if not provided
  const date = new Date().toISOString().split('T')[0]
  const finalFilename = filename.includes('.xlsx') 
    ? filename 
    : `${filename}_${date}.xlsx`
  
  // Save file
  XLSX.writeFile(wb, finalFilename)
}

/**
 * Predefined export function for Orders/Sales data
 */
export type { ExcelOrder, ExcelCustomer, ExcelProduct, ExcelCreditSale, Translations }
export const exportOrdersToExcel = (
  orders: ExcelOrder[], 
  translations: Translations, 
  filename: string = 'Orders_Export'
) => {
  const exportData = orders.map(order => ({
    'Order Number': order.orderNumber,
    'Customer': order.customer?.fullName || 'N/A',
    'Customer Phone': order.customer?.phone || 'N/A',
    'Items Count': order.orderItems?.length || 0,
    'Total Amount': `${translations.currency} ${Number(order.totalAmount || 0).toLocaleString()}`,
    'Order Status': translations[order.status?.toLowerCase()] || order.status,
    'Payment Status': translations[order.paymentStatus?.toLowerCase()] || order.paymentStatus,
    'Payment Method': order.paymentMethod || 'Cash',
    'Order Date': new Date(order.orderDate).toLocaleDateString(),
    'Order Time': new Date(order.orderDate).toLocaleTimeString()
  }))

  exportToExcel({
    data: exportData,
    filename,
    sheetName: 'Orders',
    columnWidths: [20, 25, 15, 12, 15, 15, 15, 15, 12, 12]
  })
}

/**
 * Predefined export function for Customers data
 */
export const exportCustomersToExcel = (
  customers: ExcelCustomer[], 
  translations: Translations, 
  filename: string = 'Customers_Export'
) => {
  const exportData = customers.map(customer => ({
    'Customer Name': customer.name || 'N/A',
    'Email': customer.email || 'No email',
    'Phone': customer.phone || 'No phone',
    'Address': customer.address || 'No address',
    'ID Number': customer.idNumber || 'N/A',
    'Status': translations[customer.status] || customer.status,
    'Total Orders': customer.totalOrders || 0,
    'Total Spent': `${translations.currency} ${Number(customer.totalSpent || 0).toLocaleString()}`,
    'Credit Limit': `${translations.currency} ${Number(customer.creditLimit || 0).toLocaleString()}`,
    'Outstanding Balance': `${translations.currency} ${Number(customer.outstandingBalance || 0).toLocaleString()}`,
    'Credit Score': translations[customer.creditScore] || customer.creditScore,
    'Registration Date': customer.registrationDate || 'N/A',
    'Last Order Date': customer.lastOrderDate || 'Never'
  }))

  exportToExcel({
    data: exportData,
    filename,
    sheetName: 'Customers',
    columnWidths: [25, 30, 15, 30, 15, 12, 12, 15, 15, 18, 15, 15, 15]
  })
}

/**
 * Predefined export function for Products data
 */
export const exportProductsToExcel = (
  products: ExcelProduct[], 
  translations: Translations, 
  filename: string = 'Products_Export'
) => {
  const exportData = products.map(product => ({
    'Product Name': product.name || 'N/A',
    'Product Name (Swahili)': product.nameSwahili || 'N/A',
    'Description': product.description || 'No description',
    'Category': product.category?.name || 'No category',
    'SKU': product.sku || 'N/A',
    'Barcode': product.barcode || 'N/A',
    'Unit': product.unit || 'N/A',
    'Retail Price': `${translations.currency} ${Number(product.price).toLocaleString()}`,
    'Wholesale Price': product.wholesalePrice ? `${translations.currency} ${Number(product.wholesalePrice).toLocaleString()}` : 'N/A',
    'Cost Price': product.costPrice ? `${translations.currency} ${Number(product.costPrice).toLocaleString()}` : 'N/A',
    'Stock Quantity': product.inventory?.quantity || 0,
    'Reorder Point': product.inventory?.reorderPoint || 'N/A',
    'Max Stock': product.inventory?.maxStock || 'N/A',
    'Location': product.inventory?.location || 'N/A',
    'Status': product.isActive ? translations.active || 'Active' : translations.inactive || 'Inactive',
    'Draft Status': product.isDraft ? translations.draft || 'Draft' : translations.published || 'Published',
    'Created Date': new Date(product.createdAt).toLocaleDateString(),
    'Updated Date': new Date(product.updatedAt).toLocaleDateString()
  }))

  exportToExcel({
    data: exportData,
    filename,
    sheetName: 'Products',
    columnWidths: [25, 25, 30, 20, 15, 15, 10, 15, 15, 15, 12, 12, 12, 15, 12, 15, 15, 15]
  })
}

/**
 * Predefined export function for Credit Sales data
 */
export const exportCreditSalesToExcel = (
  creditSales: ExcelCreditSale[], 
  translations: Translations, 
  filename: string = 'Credit_Sales_Export'
) => {
  const exportData = creditSales.map(sale => ({
    'Sale Number': sale.saleNumber || 'N/A',
    'Customer Name': sale.customerName || 'N/A',
    'Customer Email': sale.customerEmail || 'No email',
    'Customer Phone': sale.customerPhone || 'No phone',
    'Products Count': sale.products?.length || 0,
    'Product Names': sale.products?.map(p => p.name).join(', ') || 'N/A',
    'Total Amount': `${translations.currency} ${Number(sale.totalAmount).toLocaleString()}`,
    'Amount Paid': `${translations.currency} ${Number(sale.amountPaid).toLocaleString()}`,
    'Outstanding Balance': `${translations.currency} ${Number(sale.outstandingBalance).toLocaleString()}`,
    'Payment Plan': sale.paymentPlan || 'N/A',
    'Payment Method': sale.paymentMethod || 'N/A',
    'Sale Status': translations[sale.status.toLowerCase()] || sale.status,
    'Payment Status': translations[sale.paymentStatus.toLowerCase()] || sale.paymentStatus,
    'Sale Date': new Date(sale.saleDate).toLocaleDateString(),
    'Due Date': sale.dueDate ? new Date(sale.dueDate).toLocaleDateString() : 'N/A',
    'Last Payment Date': sale.lastPaymentDate ? new Date(sale.lastPaymentDate).toLocaleDateString() : 'Never',
    'Next Payment Date': sale.nextPaymentDate ? new Date(sale.nextPaymentDate).toLocaleDateString() : 'N/A'
  }))

  exportToExcel({
    data: exportData,
    filename,
    sheetName: 'Credit Sales',
    columnWidths: [20, 25, 30, 15, 12, 40, 15, 15, 18, 15, 15, 15, 15, 15, 15, 15, 15]
  })
}
