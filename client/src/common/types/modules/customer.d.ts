import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'

/**
 * Tipos permitidos para el tipo de cliente
 * regular = Persona natural
 * final_consumer = Consumidor final
 */
export type CustomerType = 'regular' | 'final_consumer'

/**
 * Tipos permitidos para identificación
 * 04 = RUC
 * 05 = Cédula
 * 06 = Pasaporte
 * 07 = Consumidor Final
 */
export type IdentificationType = '04' | '05' | '06' | '07'

export interface I_CustomerBase {
	id: string
	createdAt: string | Date
	updatedAt: string | Date
	deletedAt: string | Date
}

export interface I_Customer extends I_CustomerBase {
	customerType: CustomerType
	identificationType: IdentificationType
	identificationNumber: string
	firstName?: string
	lastName?: string
	address?: string
	phone?: string
	email?: string
}

export interface I_CustomerId {
	id: string
}

export type I_CreateCustomer = I_Customer

export type I_UpdateCustomer = I_Customer

export interface I_CustomerResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_Customer[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
