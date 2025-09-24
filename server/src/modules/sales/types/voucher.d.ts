export interface SaleToVoucher {
  id?: string
  createdAt?: Date
  subtotal?: number
  discountAmount?: number
  taxAmount?: number
  total?: number
  change?: number
  claveAcceso?: string
  customer?: {
    firstName?: string
    lastName?: string
    identificationNumber?: string
    email?: string
  }
  establishment?: {
    companyName?: string
    tradeName?: string
    ruc?: string
    parentEstablishmentAddress?: string
  }
  items?: Array<{
    productName: string
    quantity: number
    unitPrice: number
  }>
  paymentMethods?: Array<{
    method: string
    amount: number
  }>
  facturaInfo?: any
  user?: {
    firstName?: string
    lastName?: string
  }
}
