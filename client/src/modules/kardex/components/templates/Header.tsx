'use client'

import { Icons } from '@/components/icons'
import { useCallback, useState } from 'react'
import { useKardex } from '@/common/hooks/useKardex'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'

interface HeaderProps {
	onRefresh: () => void
	totalRecords: number
	selectedProductId?: string // ID del producto seleccionado para filtrar
	onProductFilterChange?: (productId: string | undefined) => void
}

// Configuración de exportación actualizada para kardex
const EXPORT_CONFIG = {
	fileName: 'Kardex',
	reportTitle: 'Reporte de Kardex',
	columnLabels: {
		'product.code': 'Cod. Producto',
		'product.barCode': 'Cod. Barra',
		movementType: 'Tipo de Movimiento',
		quantity: 'Cantidad',
		unitCost: 'Costo Unitario',
		subtotal: 'Subtotal',
		taxRate: 'Tasa de Impuesto (%)',
		taxAmount: 'Monto Impuesto',
		total: 'Total',
		stockBefore: 'Stock Anterior',
		stockAfter: 'Stock Posterior',
		reason: 'Razón',
		'user.dni': 'Usuario',
		createdAt: 'Fecha de Creación',
	},
	columnMappings: {
		movementType: {
			type: 'enum' as const,
			valueMap: {
				purchase: 'Compra',
				sale: 'Venta',
				adjustment: 'Ajuste',
				transfer: 'Transferencia',
				return: 'Devolución',
			},
		},
		unitCost: {
			type: 'currency' as const,
			format: (value: number) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
		},
		subtotal: {
			type: 'currency' as const,
			format: (value: number) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
		},
		taxAmount: {
			type: 'currency' as const,
			format: (value: number) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
		},
		total: {
			type: 'currency' as const,
			format: (value: number) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
		},
		taxRate: {
			type: 'percentage' as const,
			format: (value: number) => `${value}%`,
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
	excludeColumns: ['__typename', 'id', 'product.id', 'user.id'],
	// Configuración de grupos de columnas
	columnGroups: {
		product: ['product.code', 'product.codeBar'],
		movement: ['movementType', 'quantity', 'reason'],
		financial: ['unitCost', 'subtotal', 'taxRate', 'taxAmount', 'total'],
		stock: ['stockBefore', 'stockAfter'],
		user: ['user.dni'],
		dates: ['createdAt'],
	},
	customGroupConfig: {
		product: {
			label: 'Información del Producto',
			icon: <Icons.package className='h-4 w-4' />,
		},
		movement: {
			label: 'Movimiento',
			icon: <Icons.chevronDown className='h-4 w-4' />,
		},
		financial: {
			label: 'Información Financiera',
			icon: <Icons.userDollar className='h-4 w-4' />,
		},
		stock: {
			label: 'Control de Stock',
			icon: <Icons.package className='h-4 w-4' />,
		},
		user: {
			label: 'Usuario',
			icon: <Icons.user className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		'product.code': 'text' as const,
		'product.codeBar': 'text' as const,
		movementType: 'text' as const,
		quantity: 'number' as const,
		unitCost: 'currency' as const,
		subtotal: 'currency' as const,
		taxRate: 'percentage' as const,
		taxAmount: 'currency' as const,
		total: 'currency' as const,
		stockBefore: 'number' as const,
		stockAfter: 'number' as const,
		reason: 'text' as const,
		'user.dni': 'text' as const,
		createdAt: 'date' as const,
	},
}

export function Header({ onRefresh, totalRecords, selectedProductId, onProductFilterChange }: HeaderProps) {
	// Construir filtros para el hook useKardex
	const filters: Record<string, string> = {}
	if (selectedProductId) filters.productId = selectedProductId

	const { recordsData, loading } = useKardex({
		limit: 9999,
		filters: Object.keys(filters).length > 0 ? filters : undefined,
	})

	const { exportData } = useGenericExport(EXPORT_CONFIG)
	const [exportDateFilters, setExportDateFilters] = useState<DateFilters>({})

	const kardexData = recordsData?.data?.items ?? []
	const hasRecords = kardexData.length > 0

	// Función para aplanar los datos anidados para la exportación
	const flattenKardexData = (data: any[]) => {
		return data.map(item => ({
			'product.code': item.product?.code || '',
			'product.codeBar': item.product?.codeBar || '',
			movementType: item.movementType,
			quantity: item.quantity,
			unitCost: item.unitCost,
			subtotal: item.subtotal,
			taxRate: item.taxRate,
			taxAmount: item.taxAmount,
			total: item.total,
			stockBefore: item.stockBefore,
			stockAfter: item.stockAfter,
			reason: item.reason,
			'user.dni': `${item.user?.firstdniName}`,
			createdAt: item.createdAt,
		}))
	}

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[], dateFilters?: DateFilters) => {
		let dataToExport = [...kardexData]

		// Aplicar filtros de fecha si están definidos
		if (dateFilters && Object.keys(dateFilters).length > 0) {
			dataToExport = dataToExport.filter(item => {
				return Object.entries(dateFilters).every(([filterType, range]) => {
					if (!range || (!range.startDate && !range.endDate)) return true

					const itemDate = new Date(item[filterType])
					const startDate = range.startDate ? new Date(range.startDate) : null
					const endDate = range.endDate ? new Date(range.endDate) : null

					if (startDate && itemDate < startDate) return false
					if (endDate && itemDate > endDate) return false

					return true
				})
			})
		}

		// Aplanar los datos para la exportación
		const flattenedData = flattenKardexData(dataToExport)
		await exportData(flattenedData, format, selectedColumns)
	}

	const handleDateFilterChange = (filterType: DateFilterType, range: DateRange) => {
		setExportDateFilters(prev => ({
			...prev,
			[filterType]: range,
		}))
	}

	const handleClearDateFilter = (filterType: DateFilterType) => {
		setExportDateFilters(prev => {
			const updated = { ...prev }
			delete updated[filterType]
			return updated
		})
	}

	const handleExportSheetOpen = useCallback(async () => onRefresh(), [onRefresh])

	// Función para obtener el nombre del producto seleccionado
	const getSelectedProductName = () => {
		if (!selectedProductId || kardexData.length === 0) return null
		const firstRecord = kardexData[0]
		return firstRecord?.product?.name || null
	}

	const selectedProductName = getSelectedProductName()

	return (
		<ModuleHeader
			title={selectedProductName ? `Kardex - ${selectedProductName}` : 'Kardex'}
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					{/* Información del filtro actual */}
					{selectedProductId && selectedProductName && (
						<div className='text-muted-foreground flex items-center gap-2 text-sm'>
							<Icons.filter className='h-4 w-4' />
							<span>Filtrado por: {selectedProductName}</span>
							{onProductFilterChange && (
								<button
									onClick={() => onProductFilterChange(undefined)}
									className='text-red-500 hover:text-red-700'
									title='Limpiar filtro'>
									<Icons.x className='h-3 w-3' />
								</button>
							)}
						</div>
					)}

					<ExportButton
						data={flattenKardexData(kardexData)}
						totalRecords={totalRecords}
						loading={loading}
						onExport={handleExport}
						onSheetOpen={handleExportSheetOpen}
						config={{
							text: 'Exportar',
							size: 'lg',
							variant: 'ghost',
							disabled: !hasRecords || loading,
						}}
						exportConfig={{
							columnLabels: EXPORT_CONFIG.columnLabels,
							columnTypes: EXPORT_CONFIG.columnTypes,
							excludeColumns: EXPORT_CONFIG.excludeColumns,
							columnGroups: EXPORT_CONFIG.columnGroups,
							customGroupConfig: EXPORT_CONFIG.customGroupConfig,
						}}
						dateFiltersConfig={{
							enabled: true,
							defaultFilters: exportDateFilters,
							availableFilters: ['createdAt'],
							onDateFilterChange: handleDateFilterChange,
							onClearDateFilter: handleClearDateFilter,
						}}
					/>
				</>
			}
		/>
	)
}
