'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { CustomerType, CustomerTypeLabels_ES } from '@/common/enums/customer.enum'

export const CustomerTypeBadge = ({ type }: { type: CustomerType }) => {
	const typeMap = {
		[CustomerType.REGULAR]: { text: CustomerTypeLabels_ES[CustomerType.REGULAR], variant: 'primary' },
		[CustomerType.FINAL_CONSUMER]: { text: CustomerTypeLabels_ES[CustomerType.FINAL_CONSUMER], variant: 'outline' },
	} as const

	return <Badge variant={typeMap[type]?.variant || 'error'} text={typeMap[type]?.text || 'Desconocido'} />
}
