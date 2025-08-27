import { SortOption } from '@/common/types/pagination'
import { PaymentMethod, PaymentMethodLabels_ES } from '@/common/enums/sale.enum'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Código (A-Z)', field: 'code', order: 'asc', key: 'code:asc' },
	{ label: 'Código (Z-A)', field: 'code', order: 'desc', key: 'code:desc' },

	{ label: 'Fecha reciente', field: 'createdAt', order: 'desc', key: 'createdAt:desc' },
	{ label: 'Fecha antigua', field: 'createdAt', order: 'asc', key: 'createdAt:asc' },
]

export const FIELDS = [
	{ key: 'code', name: 'Código' },
	{ key: 'createdAt', name: 'Fecha' },
]

export const METHOD_PAYMENT = {
	CARD: PaymentMethod.CARD,
	CASH: PaymentMethod.CASH,
	DIGITAL: PaymentMethod.DIGITAL,
}

export const METHOD_PAYMENT_OPTIONS = [
	{ label: PaymentMethodLabels_ES[METHOD_PAYMENT.CARD], value: METHOD_PAYMENT.CARD },
	{ label: PaymentMethodLabels_ES[METHOD_PAYMENT.CASH], value: METHOD_PAYMENT.CASH },
	{ label: PaymentMethodLabels_ES[METHOD_PAYMENT.DIGITAL], value: METHOD_PAYMENT.DIGITAL },
]

export type Method_payment = (typeof METHOD_PAYMENT)[keyof typeof METHOD_PAYMENT]
