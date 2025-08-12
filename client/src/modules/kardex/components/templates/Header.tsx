'use client'

import { Icons } from '@/components/icons'
import { useKardex } from '@/common/hooks/useKardex'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

const EXPORT_CONFIG = {
	fileName: 'kardex',
	reportTitle: 'Reporte de Kardex',
	columnLabels: {
		'product.name': 'Producto',
		movementType: 'Tipo de Movimiento',
		quantity: 'Cantidad',
		unitCost: 'Costo Unitario',
		total: 'Total',
		stockBefore: 'Stock Anterior',
		stockAfter: 'Stock Posterior',
		'user.name': 'Usuario',
		createdAt: 'Fecha de Creación',
	},
	columnMappings: {
		movementType: {
			type: 'enum' as const,
			valueMap: {
				purchase: 'Compra',
				return_in: 'Devolución (Entrada)',
				transfer_in: 'Transferencia (Entrada)',
				sale: 'Venta',
				return_out: 'Devolución (Salida)',
				transfer_out: 'Transferencia (Salida)',
				adjustment_in: 'Ajuste (Entrada)',
				adjustment_out: 'Ajuste (Salida)',
				damaged: 'Dañado',
				expired: 'Expirado',
			},
		},
		createdAt: {
			type: 'date' as const,
			format: (value: string) => formatDate(value, true),
		},
	},
	pdfConfig: {
		orientation: 'landscape' as const,
		headerColor: [45, 45, 45] as const,
		groupDateAtColumns: false,
	},
	excludeColumns: ['__typename', 'id', 'user', 'product', 'updatedAt', 'subtotal', 'taxRate', 'taxAmount', 'reason'],
	columnGroups: {
		basic: ['product.name', 'movementType', 'quantity', 'unitCost', 'total'],
		stock: ['stockBefore', 'stockAfter'],
		audit: ['user.name', 'createdAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información del Movimiento',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		stock: {
			label: 'Control de Stock',
			icon: <Icons.box className='h-4 w-4' />,
		},
		audit: {
			label: 'Auditoría',
			icon: <Icons.user className='h-4 w-4' />,
		},
	},
	columnTypes: {
		'product.name': 'text' as const,
		movementType: 'text' as const,
		quantity: 'number' as const,
		unitCost: 'number' as const,
		total: 'number' as const,
		stockBefore: 'number' as const,
		stockAfter: 'number' as const,
		'user.name': 'text' as const,
		createdAt: 'date' as const,
	},
}

export function KardexHeader() {
	const { records: recordsData, loading } = useKardex()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const kardexData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(kardexData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Kardex'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<ExportButton
					data={kardexData}
					totalRecords={totalRecords}
					loading={loading}
					onExport={handleExport}
					exportConfig={{
						columnLabels: EXPORT_CONFIG.columnLabels,
						columnTypes: EXPORT_CONFIG.columnTypes,
						excludeColumns: EXPORT_CONFIG.excludeColumns,
						columnGroups: EXPORT_CONFIG.columnGroups,
						customGroupConfig: EXPORT_CONFIG.customGroupConfig,
					}}
				/>
			}
		/>
	)
}
