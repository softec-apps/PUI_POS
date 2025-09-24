import jsPDF from 'jspdf'
import { formatDate } from '@/common/utils/dateFormater-util'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { SaleToVoucher } from '@/modules/sales/types/voucher'

const fitText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxLines = 2,
  lineHeight = 4,
) => {
  const splitted = doc.splitTextToSize(String(text || ''), maxWidth)
  const lines = splitted.slice(0, maxLines)

  if (splitted.length > maxLines) {
    let last = lines[maxLines - 1]
    if (last.length > 3) last = last.substring(0, last.length - 3) + '...'
    lines[maxLines - 1] = last
  }

  lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight))
  return lines.length * lineHeight
}

const PaymentMethodLabels_ES: Record<string, string> = {
  cash: 'Efectivo',
  credit: 'Crédito',
  debit: 'Débito',
  transfer: 'Transferencia',
  check: 'Cheque',
  credit_card: 'Tarjeta de crédito',
  digital: 'Pago digital',
  card: 'Tarjeta',
}

// Función modificada para retornar base64 en lugar de descargar
export const generateSaleReceiptPDFBase64 = (
  saleData: SaleToVoucher = {},
): string => {
  const doc = new jsPDF({ unit: 'mm', format: [80, 250] })
  const pageWidth = 80
  let y = 6

  const leftX = 5
  const rightX = 75

  const line = (char = '-', space = 2) => {
    doc.setFontSize(7)
    doc.setFont('Courier', 'normal')
    doc.text(char.repeat(47), leftX, y)
    y += space
  }

  const center = (text: string, size = 7.5, bold = false, space = 4) => {
    doc.setFontSize(size)
    doc.setFont('Courier', bold ? 'bold' : 'normal')
    const textWidth = doc.getTextWidth(text)
    doc.text(text, (pageWidth - textWidth) / 2, y)
    y += space
  }

  const right = (text: string | number, x = rightX) => {
    doc.text(String(text), x, y, { align: 'right' })
  }

  // === ENCABEZADO ===
  if (saleData.establishment?.companyName)
    center(saleData.establishment.companyName, 9, true, 5)
  if (saleData.establishment?.tradeName)
    center(saleData.establishment.tradeName, 8, false, 4)
  if (saleData.establishment?.ruc)
    center(`RUC: ${saleData.establishment.ruc}`, 7, false, 3)
  if (saleData.establishment?.parentEstablishmentAddress)
    center(saleData.establishment.parentEstablishmentAddress, 6.5, false, 3)

  y += 4

  // Mostrar clave de acceso solo si existe
  const clave = saleData.facturaInfo?.claveAcceso || saleData.claveAcceso
  if (clave) {
    doc.setFont('Courier', 'normal')
    doc.setFontSize(6.5)
    doc.text('CLAVE DE ACCESO:', leftX, y)
    y += 4
    const claveParts = clave.match(/.{1,40}/g) || []
    claveParts.forEach((part) => {
      doc.text(part, leftX, y)
      y += 4
    })
    y += 2
  } else {
    // Mostrar "DOCUMENTO NO LEGAL" si no hay clave de acceso
    doc.setFont('Courier', 'bold')
    doc.setFontSize(8)
    center('*** DOCUMENTO NO LEGAL ***', 8, true, 4)
    y += 2
  }

  // === INFO VENTA ===
  doc.setFontSize(6.5)
  doc.setFont('Courier', 'normal')
  doc.text(
    `Factura: ${saleData.id ? saleData.id.split('-').pop() : ''}`,
    leftX,
    y,
  )
  y += 4
  doc.text(`Fecha: ${formatDate(saleData.createdAt || new Date())}`, leftX, y)
  y += 4

  const c = saleData.customer || {}
  doc.text(
    `Cliente: ${c.firstName || 'Consumidor Final'} ${c.lastName || ''}`,
    leftX,
    y,
  )
  y += 4
  doc.text(`CI/RUC: ${c.identificationNumber || '9999999999'}`, leftX, y)
  y += 4

  if (c.email) {
    doc.text(`Email: ${c.email}`, leftX, y)
    y += 4
  }

  // === INFORMACIÓN DEL VENDEDOR ===
  doc.text(
    `Atendido por: ${saleData?.user?.firstName} ${saleData?.user?.lastName}`,
    leftX,
    y,
  )
  y += 4

  line('-')
  y += 4

  // === DETALLE ===
  doc.setFont('Courier', 'bold')
  doc.text('DESCRIPCION', leftX, y)
  doc.text('CNT', 50, y, { align: 'right' })
  doc.text('P.U', 63, y, { align: 'right' })
  doc.text('TOTAL', rightX, y, { align: 'right' })
  y += 4

  doc.setFont('Courier', 'normal')
  saleData.items?.forEach((item) => {
    const used = fitText(doc, item.productName, leftX, y, 42, 2)
    doc.text(String(item.quantity), 50, y, { align: 'right' })
    doc.text(formatPrice(item.unitPrice), 63, y, { align: 'right' })
    doc.text(formatPrice(item.unitPrice * item.quantity), rightX, y, {
      align: 'right',
    })
    y += used + 1
  })

  line('-')
  y += 2

  // === TOTALES ===
  const subtotal = saleData.subtotal ?? 0
  const discount = saleData.discountAmount ?? 0
  const tax = saleData.taxAmount ?? 0
  const total = saleData.total ?? subtotal + tax - discount

  doc.text('Subtotal:', 60, y, { align: 'right' })
  right(formatPrice(subtotal))
  y += 4

  doc.text(`Impuestos:`, 60, y, { align: 'right' })
  right(formatPrice(tax))
  y += 4

  doc.text('Descuento:', 60, y, { align: 'right' })
  right(formatPrice(discount))
  y += 4

  doc.setFont('Courier', 'bold')
  doc.setFontSize(8.5)
  doc.text('TOTAL:', 60, y, { align: 'right' })
  right(formatPrice(total))
  y += 6

  line('-')
  y += 2

  // === MÉTODOS DE PAGO ===
  if (saleData.paymentMethods?.length) {
    doc.setFont('Courier', 'bold')
    doc.text('FORMA DE PAGO', leftX, y)
    y += 5
    doc.setFont('Courier', 'normal')
    saleData.paymentMethods.forEach((p) => {
      const label = PaymentMethodLabels_ES[p.method] || p.method
      doc.text(`${label}:`, 60, y, { align: 'right' })
      right(formatPrice(p.amount))
      y += 4
    })
  }

  doc.text('Cambio:', 60, y, { align: 'right' })
  right(formatPrice(saleData.change || 0))
  y += 5

  y += 5

  // === PIE ===
  center('*** GRACIAS POR SU COMPRA ***', 7, true, 5)

  // Mostrar información del SRI solo si hay clave de acceso (documento electrónico)
  if (clave) {
    center('Consulte sus comprobantes en:', 6.5, false, 3)
    center('www.sri.gob.ec', 6.5, false, 2)
  }

  // En lugar de guardar, retornamos el PDF como base64
  return doc.output('datauristring').split(',')[1] // Eliminamos el prefijo "data:application/pdf;base64,"
}

// Función para convertir saleWithCompleteInfo al formato SaleToVoucher
export const convertSaleToVoucherFormat = (
  saleWithCompleteInfo: any,
): SaleToVoucher => {
  return {
    id: saleWithCompleteInfo.id,
    createdAt: saleWithCompleteInfo.createdAt,
    subtotal: saleWithCompleteInfo.subtotal,
    discountAmount: saleWithCompleteInfo.discountAmount,
    taxAmount: saleWithCompleteInfo.taxAmount,
    total: saleWithCompleteInfo.total,
    change: saleWithCompleteInfo.change,
    claveAcceso: saleWithCompleteInfo.clave_acceso,
    customer: {
      firstName: saleWithCompleteInfo.customer?.firstName,
      lastName: saleWithCompleteInfo.customer?.lastName,
      identificationNumber: saleWithCompleteInfo.customer?.identificationNumber,
      email: saleWithCompleteInfo.customer?.email,
    },
    establishment: {
      companyName: saleWithCompleteInfo.establishment?.companyName,
      tradeName: saleWithCompleteInfo.establishment?.tradeName,
      ruc: saleWithCompleteInfo.establishment?.ruc,
      parentEstablishmentAddress:
        saleWithCompleteInfo.establishment?.parentEstablishmentAddress,
    },
    items:
      saleWithCompleteInfo.items?.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) || [],
    paymentMethods: saleWithCompleteInfo.paymentMethods || [],
    facturaInfo: saleWithCompleteInfo.facturaInfo || null,
    user: {
      firstName: saleWithCompleteInfo?.user?.firstName,
      lastName: saleWithCompleteInfo?.user?.lastName,
    },
  }
}
