import { useMemo } from 'react'
import { useKardex, UseKardexParams } from '@/common/hooks/useKardex'

const enum KardexMovementTypeEnum {
	PURCHASE = 'purchase',
	RETURN_IN = 'return_in',
	TRANSFER_IN = 'transfer_in',
	SALE = 'sale',
	RETURN_OUT = 'return_out',
	TRANSFER_OUT = 'transfer_out',
	ADJUSTMENT_IN = 'adjustment_in',
	ADJUSTMENT_OUT = 'adjustment_out',
	DAMAGED = 'damaged',
	EXPIRED = 'expired',
}

export const useKardexData = (params: UseKardexParams) => {
	const kardexHook = useKardex(params)

	// 🔹 Función para calcular estadísticas (se reutiliza para "records" y "lasted")
	const buildStats = (items: any[] = [], pagination?: any, error?: string) => {
		const stats = {
			totalRecords: items.length,
			ADJUSTMENT_IN: 0,
			ADJUSTMENT_OUT: 0,
			DAMAGED: 0,
			EXPIRED: 0,
			activeRecords: 0,
			RETURN_IN: 0,
			RETURN_OUT: 0,
			SALE: 0,
			TRANSFER_IN: 0,
			TRANSFER_OUT: 0,
		}

		items.forEach(item => {
			switch (item.movementType) {
				case KardexMovementTypeEnum.ADJUSTMENT_IN:
					stats.ADJUSTMENT_IN++
					break
				case KardexMovementTypeEnum.ADJUSTMENT_OUT:
					stats.ADJUSTMENT_OUT++
					break
				case KardexMovementTypeEnum.DAMAGED:
					stats.DAMAGED++
					break
				case KardexMovementTypeEnum.EXPIRED:
					stats.EXPIRED++
					break
				case KardexMovementTypeEnum.PURCHASE:
					stats.activeRecords++
					break
				case KardexMovementTypeEnum.RETURN_IN:
					stats.RETURN_IN++
					break
				case KardexMovementTypeEnum.RETURN_OUT:
					stats.RETURN_OUT++
					break
				case KardexMovementTypeEnum.SALE:
					stats.SALE++
					break
				case KardexMovementTypeEnum.TRANSFER_IN:
					stats.TRANSFER_IN++
					break
				case KardexMovementTypeEnum.TRANSFER_OUT:
					stats.TRANSFER_OUT++
					break
			}
		})

		return {
			items,
			pagination,
			isEmpty: pagination?.totalRecords === 0,
			hasError: !!error,
			generalStats: stats,
		}
	}

	// 🔹 Stats del query principal
	const data = useMemo(() => {
		const items = kardexHook.recordsData?.data?.items || []
		const pagination = kardexHook.recordsData?.data?.pagination
		return buildStats(items, pagination, kardexHook.error)
	}, [kardexHook.recordsData, kardexHook.error])

	// 🔹 Stats del query "lasted"
	const lastedData = useMemo(() => {
		const items = kardexHook.lastedRecordsData?.data?.items || []
		const pagination = kardexHook.lastedRecordsData?.data?.pagination
		return buildStats(items, pagination, kardexHook.errorLasted)
	}, [kardexHook.lastedRecordsData, kardexHook.errorLasted])

	return {
		...kardexHook,
		data, // stats del query principal
		lastedData, // stats del query "lasted"
	}
}
