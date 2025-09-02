'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { IdentificationType, IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'
import { I_Customer } from '@/common/types/modules/customer'

export const IdentificationTypeBadge = ({
	identificationType,
}: {
	identificationType: I_Customer['identificationType']
}) => {
	const identificationTypeMap = {
		[IdentificationType.RUC]: { text: IdentificationTypeLabels_ES[IdentificationType.RUC], variant: 'info' },
		[IdentificationType.IDENTIFICATION_CARD]: {
			text: IdentificationTypeLabels_ES[IdentificationType.IDENTIFICATION_CARD],
			variant: 'success',
		},
		[IdentificationType.PASSPORT]: {
			text: IdentificationTypeLabels_ES[IdentificationType.PASSPORT],
			variant: 'purple',
		},
		[IdentificationType.FINAL_CONSUMER]: {
			text: IdentificationTypeLabels_ES[IdentificationType.FINAL_CONSUMER],
			variant: 'orange',
		},
	} as const

	return (
		<Badge
			variant={identificationTypeMap[identificationType]?.variant || 'error'}
			text={identificationTypeMap[identificationType]?.text || 'Desconocido'}
		/>
	)
}
