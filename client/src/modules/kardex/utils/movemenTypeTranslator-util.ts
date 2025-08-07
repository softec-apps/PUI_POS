import { I_Kardex } from '@/common/types/modules/kardex'

const movementTypeTranslations: Record<I_Kardex['movementType'], string> = {
	purchase: 'Compra',
	return_in: 'Devolución de cliente',
	transfer_in: 'Transferencia entrante',
	sale: 'Venta',
	return_out: 'Devolución a proveedor',
	transfer_out: 'Transferencia saliente',
	adjustment_in: 'Ajuste positivo',
	adjustment_out: 'Ajuste negativo',
	damaged: 'Dañado',
	expired: 'Vencido',
}

export const translateMovementType = (movementType: I_Kardex['movementType']): string => {
	return movementTypeTranslations[movementType] || movementType
}
