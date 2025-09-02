import { KardexMovementTypeEnum } from '@/common/types/modules/kardex'

const movementTypeTranslations: Record<KardexMovementTypeEnum, string> = {
	[KardexMovementTypeEnum.PURCHASE]: 'Compra',
	[KardexMovementTypeEnum.RETURN_IN]: 'Devolución de cliente',
	[KardexMovementTypeEnum.TRANSFER_IN]: 'Transferencia entrante',
	[KardexMovementTypeEnum.SALE]: 'Venta',
	[KardexMovementTypeEnum.RETURN_OUT]: 'Devolución a proveedor',
	[KardexMovementTypeEnum.TRANSFER_OUT]: 'Transferencia saliente',
	[KardexMovementTypeEnum.ADJUSTMENT_IN]: 'Ajuste positivo',
	[KardexMovementTypeEnum.ADJUSTMENT_OUT]: 'Ajuste negativo',
	[KardexMovementTypeEnum.DAMAGED]: 'Dañado',
	[KardexMovementTypeEnum.EXPIRED]: 'Vencido',
}

export const translateMovementType = (movementType: KardexMovementTypeEnum): string => {
	return movementTypeTranslations[movementType] || movementType
}
