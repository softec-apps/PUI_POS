'use client'

import { I_User } from '@/common/types/modules/user'
import { Badge } from '@/components/layout/atoms/Badge'

export const UserRoleBadge = ({ role }: { role: I_User['role'] }) => {
	const roleMap = {
		admin: { text: 'Administrador', variant: 'default' },
		cashier: { text: 'Cajero', variant: 'info' },
		manager: { text: 'Gerente', variant: 'teal' },
		inventory: { text: 'Inventario', variant: 'orange' },
		customer: { text: 'Cliente', variant: 'indigo' },
	} as const

	return (
		<Badge
			variant={roleMap[role.name as keyof typeof roleMap]?.variant || 'secondary'}
			text={roleMap[role.name as keyof typeof roleMap]?.text || 'Desconocido'}
		/>
	)
}
