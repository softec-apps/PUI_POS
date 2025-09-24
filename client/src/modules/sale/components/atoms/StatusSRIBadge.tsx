'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { StatusSRI, StatusSRILabels_ES } from '@/common/enums/sale.enum'

type Props = {
	estado?: StatusSRI
}

export const StatusSRIBadge: React.FC<Props> = ({ estado }) => {
	// Mapear estado → variante de Badge
	const variantMap: Record<StatusSRI, 'default' | 'destructive' | 'warning' | 'success' | 'secondary' | 'info'> = {
		[StatusSRI.AUTHORIZED]: 'success',
		[StatusSRI.ERROR]: 'destructive',
		[StatusSRI.NO_ELECTRONIC]: 'info',
		[StatusSRI.PROCESANDO]: 'warning',
	}

	const variant = estado ? variantMap[estado] : 'default'
	const label = StatusSRILabels_ES[estado ?? StatusSRI.NO_ELECTRONIC] || 'No aplica'

	return <Badge variant={variant} text={label} />
}
