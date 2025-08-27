'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { I_Category } from '@/common/types/modules/category'

export const StatusBadge = ({ status }: { status: I_Category['status'] }) => {
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
