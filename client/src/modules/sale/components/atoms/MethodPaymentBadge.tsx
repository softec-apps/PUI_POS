'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { PaymentMethod, PaymentMethodLabels_ES } from '@/common/enums/sale.enum'

export const MethodPaymentBadge = ({ type }: { type: PaymentMethod }) => {
	const typeMap = {
		[PaymentMethod.CASH]: { text: PaymentMethodLabels_ES[PaymentMethod.CASH], variant: 'success' },
		[PaymentMethod.CARD]: { text: PaymentMethodLabels_ES[PaymentMethod.CARD], variant: 'cyan' },
		[PaymentMethod.DIGITAL]: { text: PaymentMethodLabels_ES[PaymentMethod.DIGITAL], variant: 'info' },
	} as const

	return <Badge variant={typeMap[type]?.variant || 'error'} text={typeMap[type]?.text || 'Desconocido'} />
}
