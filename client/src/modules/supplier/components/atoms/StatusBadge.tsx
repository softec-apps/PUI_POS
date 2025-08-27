'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { I_Supplier } from '@/common/types/modules/supplier'

export const StatusBadge = ({ status }: { status: I_Supplier['status'] }) => {
	const statusMap = {
		active: { text: 'Activo', variant: 'success' },
		inactive: { text: 'Inactivo', variant: 'destructive' },
	} as const

	return (
		<Badge
			variant={statusMap[status as keyof typeof statusMap]?.variant || 'error'}
			text={statusMap[status as keyof typeof statusMap]?.text || 'Desconocido'}
		/>
	)
}
