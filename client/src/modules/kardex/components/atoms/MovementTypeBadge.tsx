'use client'

import { Badge } from '@/components/layout/atoms/Badge'
import { I_Kardex } from '@/common/types/modules/kardex'

interface MovementTypeBadgeProps {
	movementType: I_Kardex['movementType']
}

export const MovementTypeBadge = ({ movementType }: MovementTypeBadgeProps) => {
	const movementTypeMap: Record<
		I_Kardex['movementType'],
		{ text: string; variant: Parameters<typeof Badge>[0]['variant'] }
	> = {
		purchase: { text: 'Compra', variant: 'success' },
		return_in: { text: 'Devolución de cliente', variant: 'cyan' },
		transfer_in: { text: 'Transferencia entrante', variant: 'teal' },
		sale: { text: 'Venta', variant: 'success' },
		return_out: { text: 'Devolución a proveedor', variant: 'orange' },
		transfer_out: { text: 'Transferencia saliente', variant: 'amber' },
		adjustment_in: { text: 'Ajuste positivo', variant: 'info' },
		adjustment_out: { text: 'Ajuste negativo', variant: 'destructive' },
		damaged: { text: 'Dañado', variant: 'gray' },
		expired: { text: 'Vencido', variant: 'purple' },
	}

	const badgeConfig = movementTypeMap[movementType] ?? {
		text: 'Desconocido',
		variant: 'default',
	}

	return <Badge variant={badgeConfig.variant} text={badgeConfig.text} />
}
