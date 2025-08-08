'use client'

import { I_User } from '@/modules/user/types/user'
import { Badge } from '@/components/layout/atoms/Badge'

export const UserStatusBadge = ({ status }: { status: I_User['status'] }) => {
	const statusMap = {
		Active: { text: 'Activo', variant: 'success' },
		Inactive: { text: 'Inactivo', variant: 'error' },
		active: { text: 'Activo', variant: 'success' },
		inactive: { text: 'Inactivo', variant: 'error' },
	} as const

	return (
		<Badge
			variant={statusMap[status.name as keyof typeof statusMap]?.variant || 'error'}
			text={statusMap[status.name as keyof typeof statusMap]?.text || 'Desconocido'}
		/>
	)
}
