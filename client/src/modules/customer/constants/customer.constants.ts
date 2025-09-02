import { SortOption } from '@/common/types/pagination'
import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Identificación (A-Z)', field: 'identificationNumber', order: 'asc', key: 'identificationNumber:asc' },
	{ label: 'Identificación (Z-A)', field: 'identificationNumber', order: 'desc', key: 'identificationNumber:desc' },

	{ label: 'Email (A-Z)', field: 'email', order: 'asc', key: 'email:asc' },
	{ label: 'Email (Z-A)', field: 'email', order: 'desc', key: 'email:desc' },

	{ label: 'Fecha reciente', field: 'createdAt', order: 'desc', key: 'createdAt:desc' },
	{ label: 'Fecha antigua', field: 'createdAt', order: 'asc', key: 'createdAt:asc' },
]

export const FIELDS = [
	{ key: 'identificationNumber', name: 'Identificación' },
	{ key: 'email', name: 'Email' },
	{ key: 'createdAt', name: 'Fecha' },
]

export const TYPE_CUSTOMER = {
	REGULAR: CustomerType.REGULAR,
	FINAL_CONSUMER: CustomerType.FINAL_CONSUMER,
}

export const TYPE_CUSTOMER_OPTIONS = [
	{ label: 'Regular', value: TYPE_CUSTOMER.REGULAR },
	{ label: 'Cosumidor final', value: TYPE_CUSTOMER.FINAL_CONSUMER },
]

export type Type_CUSTOMER = (typeof TYPE_CUSTOMER)[keyof typeof TYPE_CUSTOMER]

export const IdentificationTypeLabels: Record<IdentificationType, string> = {
	[IdentificationType.RUC]: 'RUC',
	[IdentificationType.PASSPORT]: 'Pasaporte',
	[IdentificationType.FINAL_CONSUMER]: 'Consumidor Final',
	[IdentificationType.IDENTIFICATION_CARD]: 'Cédula',
}
