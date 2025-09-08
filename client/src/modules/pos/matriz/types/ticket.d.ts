export interface SaleToTicket {
	id?: string
	claveAcceso?: string
	createdAt?: Date | string
	subtotal?: number
	discount?: number
	taxRate?: number
	taxAmount?: number
	total?: number
	change?: number
	items?: SaleItem[]
	customer?: Customer
	establishment?: Establishment
	paymentMethods?: PaymentMethod[]
	facturaInfo?: FacturaInfo
	billing?: BillingInfo
}

interface SaleItem {
	productName: string
	quantity: number
	unitPrice: number
	totalPrice?: number
}

interface Customer {
	firstName?: string
	lastName?: string
	identificationNumber?: string
	email?: string
}

interface Establishment {
	companyName?: string
	tradeName?: string
	ruc?: string
	parentEstablishmentAddress?: string
}

interface PaymentMethod {
	method: string
	amount: number
}

interface FacturaInfo {
	claveAcceso?: string
	estado?: string
	processing?: boolean
}

interface BillingInfo {
	facturaResponse?: {
		attempted?: boolean
		success?: boolean
		message?: string
		sriResponse?: {
			data?: {
				clave_acceso?: string
				estado?: string
				processing?: boolean
			}
		}
	}
}
