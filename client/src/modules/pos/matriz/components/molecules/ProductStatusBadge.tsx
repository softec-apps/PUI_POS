'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { I_Product } from '@/common/types/modules/product'

export const ProductStatusBadge = ({ status }: { status: I_Product['status'] }) => {
	const statusMap = {
		active: { text: 'Activo', variant: 'success' },
		draft: { text: 'Borrador', variant: 'info' },
		out_of_stock: { text: 'Sin Stock', variant: 'warning' },
		discontinued: { text: 'Descontinuado', variant: 'orange' },
		inactive: { text: 'Inactivo', variant: 'error' },
	} as const

	return (
		<Badge
			decord={false}
			variant={statusMap[status]?.variant || 'error'}
			text={statusMap[status]?.text || 'Desconocido'}
		/>
	)
}
