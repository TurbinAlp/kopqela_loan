import { NextRequest } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { getAuthContext } from '../../../../../../lib/rbac/middleware'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(request)
  if (!auth) {
    return new Response('Unauthorized', { status: 401 })
  }

  const id = parseInt(params.id)
  if (Number.isNaN(id)) return new Response('Invalid order id', { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      orderItems: { include: { product: true } },
      business: { include: { businessSetting: true } }
    }
  })
  if (!order) return new Response('Not found', { status: 404 })

  // simple access check
  const biz = await prisma.business.findFirst({
    where: {
      id: order.businessId,
      OR: [
        { ownerId: auth.userId },
        { userPermissions: { some: { userId: auth.userId, isActive: true } } }
      ]
    },
    select: { id: true }
  })
  if (!biz) return new Response('Forbidden', { status: 403 })

  // Get cashier name for potential use
  let cashierName = ''
  const rows = await prisma.$queryRawUnsafe<Array<{ created_by: number | null }>>(`SELECT created_by FROM "orders" WHERE id=${id}`)
  const createdBy = rows?.[0]?.created_by
  if (typeof createdBy === 'number') {
    const u = await prisma.user.findUnique({ where: { id: createdBy }, select: { firstName: true, lastName: true } })
    cashierName = u ? `${u.firstName} ${u.lastName}`.trim() : ''
  }

  // create PDF (use standalone build to avoid fs font reads in bundled envs)
  const { default: PDFDocument } = await import('pdfkit/js/pdfkit.standalone.js')
  const doc = new PDFDocument({ size: 'A4', margin: 36 })
  const chunks: Uint8Array[] = []
  doc.on('data', (c: Uint8Array) => chunks.push(c))
  const done = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })

  const b = order.business
  const s = b?.businessSetting

  // Layout constants
  const pageWidth = 595
  const margin = 36
  const contentRight = pageWidth - margin

  // Header - RECEIPT title (16-20pt recommended)
  doc.fillColor('#111').fontSize(18).text('RECEIPT', margin, margin, { width: contentRight - margin, align: 'center' })

  // ROW 2: Business information (right side only)
  doc.moveDown(2)
  const businessInfoY = doc.y
  
  const rightSideX = pageWidth / 2 + 20
  const rightSideWidth = (pageWidth - rightSideX - margin)
  
  // Business name (slightly larger for emphasis)
  doc.fontSize(12).fillColor('#111')
  doc.text(b?.name || 'Business Name', rightSideX, businessInfoY, { width: rightSideWidth, align: 'right' })
  
  // Business contact details (standard body text)
  doc.fontSize(10).fillColor('#111')
  
  // Business email
  if (s?.email) {
    doc.text(s.email, rightSideX, businessInfoY + 18, { width: rightSideWidth, align: 'right' })
  }
  
  // Business phone
  if (s?.phone) {
    doc.text(`${s.phone}`, rightSideX, businessInfoY + 33, { width: rightSideWidth, align: 'right' })
  }
  
  // Business address
  const fullBusinessAddress = [s?.address, s?.city, s?.region].filter(Boolean).join(', ')
  if (fullBusinessAddress) {
    doc.text(fullBusinessAddress, rightSideX, businessInfoY + 48, { width: rightSideWidth, align: 'right' })
  }
  
  // ROW 3: Order details (left side, separate row) - Standard body text
  doc.moveDown(2)
  const orderDetailsY = doc.y
  doc.fontSize(10).fillColor('#111')
  doc.text(`Order Number: ${order.orderNumber}`, margin, orderDetailsY)
  doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}, ${new Date(order.orderDate).toLocaleTimeString()}`, margin, orderDetailsY + 15)
  if (cashierName) {
    doc.text(`Cashier: ${cashierName}`, margin, orderDetailsY + 30)
  }
  
  // Customer section - Section header (14-16pt recommended)
  doc.moveDown(1)
  doc.fontSize(14).fillColor('#111').text('Customer', margin, doc.y + 8)
  
  // Customer details - Standard body text (10-12pt)
  const customer = order.customer
  doc.fontSize(11).fillColor('#111')
  doc.text(customer?.fullName || 'Walk-in Customer', margin, doc.y + 8)
  
  // Customer phone
  if (customer?.phone) {
    doc.text(`Phone: ${customer.phone}`, margin, doc.y + 5)
  } else {
    doc.text('Phone: 0000000000', margin, doc.y + 5)
  }

  // Items section (simple like screenshot)
  doc.moveDown(1)
  
  const tableTop = doc.y + 8
  
  // Define column positions and widths for perfect alignment
  const colItemX = margin
  const colItemWidth = 280
  const colQtyX = colItemX + colItemWidth
  const colQtyWidth = 60
  const colPriceX = colQtyX + colQtyWidth
  const colPriceWidth = 100
  const colTotalX = colPriceX + colPriceWidth
  const colTotalWidth = 100
  const headerHeight = 18

  // WEKA LINE HAPA
  doc.moveTo(margin, tableTop).lineTo(colTotalX + colTotalWidth, tableTop).stroke()

  // Table headers - Standard body text (10-12pt recommended)
  doc.fontSize(11).fillColor('#111')
  doc.text('Item', colItemX, tableTop + 5)
  doc.text('Qty', colQtyX, tableTop + 5, { width: colQtyWidth, align: 'center' })
  doc.text('Price', colPriceX, tableTop + 5, { width: colPriceWidth, align: 'right' })
  doc.text('Total', colTotalX, tableTop + 5, { width: colTotalWidth, align: 'right' })
  
  // Line under header
  doc.moveTo(margin, tableTop + 15).lineTo(colTotalX + colTotalWidth, tableTop + 15).stroke()

  let y = tableTop + headerHeight + 5
  doc.fillColor('#111')

  const drawRow = (description: string, qty: string, price: string, total: string) => {
    // Page break if needed
    if (y > 700) {
      doc.addPage()
      y = margin
    }
    
    // Table content - Standard body text (10-12pt recommended)
    doc.fontSize(10).fillColor('#111')
    // Truncate long product names if necessary
    doc.text(description, colItemX, y, { width: colItemWidth - 10, ellipsis: true })
    doc.text(qty, colQtyX, y, { width: colQtyWidth, align: 'center' })
    doc.text(price, colPriceX, y, { width: colPriceWidth, align: 'right' })
    doc.text(total, colTotalX, y, { width: colTotalWidth, align: 'right' })
    
    y += 20
  }

  // Add order items with real data
  order.orderItems.forEach((item) => {
    const currency = s?.currency || 'TZS'
    
    drawRow(
      item.product.name,
      String(item.quantity),
      `${currency} ${Number(item.unitPrice).toLocaleString()}`,
      `${currency} ${Number(item.totalPrice).toLocaleString()}`
    )
  })

  // Simple totals section like screenshot - aligned with table
  y += 20
  const currency = s?.currency || 'TZS'

  // WEKA LINE HAPA I STICK NA HIZI SUBTOTAL SIO NA ITEMS SECTION
  doc.moveTo(margin, y - 5).lineTo(colTotalX + colTotalWidth, y - 5).stroke()
  
  // Subtotal - Standard body text (10-12pt recommended)
  doc.fontSize(11).fillColor('#111')
  doc.text('Subtotal:', colPriceX, y, { width: colPriceWidth, align: 'right' })
  doc.text(`${currency} ${Number(order.subtotal).toLocaleString()}`, colTotalX, y, { width: colTotalWidth, align: 'right' })
  
  // Grand Total - Emphasis text (12pt recommended for important totals)
  y += 20
  doc.fontSize(13).fillColor('#111')
  doc.text('Grand Total:', colPriceX, y, { width: colPriceWidth, align: 'right' })
  doc.text(`${currency} ${Number(order.totalAmount).toLocaleString()}`, colTotalX, y, { width: colTotalWidth, align: 'right' })
  
  // Payment Method section - Section header (14-16pt recommended)
  y += 40
  doc.fontSize(14).fillColor('#111')
  doc.text('Payment Method', margin, y)
  
  // Payment details - Standard body text (10-12pt recommended)
  y += 18
  doc.fontSize(11).fillColor('#111')
  doc.text(`Payment Plan: ${order.paymentPlan === 'FULL' ? 'Full Payment' : order.paymentPlan}`, margin, y)
  
  y += 15
  doc.text(`Payment Method: ${order.paymentMethod || 'Cash'}`, margin, y)

  // Footer section (centered at bottom) - Additional details (9-10pt recommended)
  const footerY = 750 // Fixed position at bottom
  
  // Thank you message - Footer text (9-10pt recommended)
  doc.fontSize(10).fillColor('#111')
  doc.text('Karibu Tena!', margin, footerY, { width: contentRight - margin, align: 'center' })
  
  // Powered by message - Small additional text (8-9pt recommended)
  doc.fontSize(8).fillColor('#666')
  doc.text('Powered by Koppela', margin, footerY + 15, { width: contentRight - margin, align: 'center' })

  doc.end()
  const buffer = await done
  const { searchParams } = new URL(request.url)
  const forceDownload = searchParams.get('download') === '1'
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${forceDownload ? 'attachment' : 'inline'}; filename="receipt-${order.orderNumber}.pdf"`
    }
  })
}


