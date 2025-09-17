import { I_User } from '@/common/types/modules/user'
import { I_Product } from '@/common/types/modules/product'
import { I_Customer } from '@/common/types/modules/customer'

/** Ítem individual de la venta */
export interface I_IdSale {
	id: string
}

export interface I_SaleBase {
	id?: string
	createdAt: string | Date
	updatedAt: string | Date
	deletedAt: string | Date
}

/** Ítem individual de la venta */
export interface I_SaleItem {
	product: I_Product
	productId: string
	productName: string
	quantity: number
	unitPrice: number
	totalPrice: number
	taxRate: number
	productCode?: string
	revenue: number
}

/** Body para creación/actualización de venta */
export interface I_Sale extends I_SaleBase {
	code: number
	estado_sri?: string
	clave_acceso?: string
	changeType: number
	customerId: string
	items: I_SaleItem[]
	paymentMethods: JSON
	receivedAmount: number
	subtotal: number
	change?: number
	taxAmount: number
	discount?: number
	taxRate: number
	total: number
	totalItems: number
	customer: I_Customer
	user: I_User
}

/** DTO para creación de venta */
export interface I_CreateSale extends I_Sale {}

/** DTO para actualización de venta */
export interface I_UpdateSale extends Partial<I_Sale> {
	id: string // ID de la venta a actualizar
}

/** Respuesta de listado de ventas */
export interface I_SalesResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_Sale[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
