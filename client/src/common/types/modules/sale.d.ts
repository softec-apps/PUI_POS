import { I_Customer } from '@/common/types/modules/customer'
import { I_Product } from '@/common/types/modules/product'
import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'
import { I_User } from './user'

export type SaleStatus = 'completed' | 'pending' | 'cancelled'

export interface I_SaleItem {
	product: I_Product
	quantity: number
	price: number // Price at the time of sale
}

export interface I_BaseSale {
	customer: I_Customer
	seller: I_User
	items: I_SaleItem[]
	total: number
	status: SaleStatus
}

export interface I_Sale extends I_BaseSale {
	id: string
	createdAt: string
	updatedAt: string
}

export interface I_CreateSale {
	customerId: string
	sellerId: string
	items: {
		productId: string
		quantity: number
		price: number
	}[]
	total: number
	status: SaleStatus
}

export interface I_UpdateSale {
	status?: SaleStatus
	// Other fields that can be updated
}

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
