'use client'

import { Icons } from '@/components/icons'
import { useCallback, useState } from 'react'
import { useBrand } from '@/common/hooks/useBrand'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'

interface HeaderProps {
	onCreateClick: () => void
	onRefresh: () => void
	totalRecords: number
}

// Configuración de exportación separada para mejor mantenibilidad
const EXPORT_CONFIG = {
	fileName: 'Marcas',
	reportTitle: 'Reporte de Marcas',
	columnLabels: {
		name: 'Nombre',
		desciption: 'Descripción',
		status: 'Estado',
		createdAt: 'Fecha de Creación',
		updatedAt: 'Última Actualización',
		deletedAt: 'Fecha de Eliminación',
	},
	columnMappings: {
		status: {
			type: 'enum' as const,
			valueMap: {
				active: 'Activo',
				inactive: 'Inactivo',
			},
		},
		createdAt: {
			type: 'date' as const,
			format: (value: string) => formatDate(value, true),
		},
		updatedAt: {
			type: 'date' as const,
			format: (value: string) => formatDate(value, true),
		},
		deletedAt: {
			type: 'date' as const,
			format: (value: string) => formatDate(value, true),
		},
	},
	pdfConfig: {
		orientation: 'landscape' as const,
		headerColor: [45, 45, 45] as const,
		groupDateAtColumns: false,
	},
	excludeColumns: ['__typename', 'id'],
	// Configuración de grupos de columnas
	columnGroups: {
		basic: ['name', 'description'],
		status: ['status'],
		dates: ['createdAt', 'updatedAt', 'deletedAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información General',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		status: {
			label: 'Estado',
			icon: <Icons.server className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		name: 'text' as const,
		description: 'text' as const,
		status: 'text' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
		deletedAt: 'date' as const,
	},
}

export function Header({ onCreateClick, onRefresh, totalRecords }: HeaderProps) {
	const { recordsData, loading } = useBrand({ limit: 9999 })
	const { exportData } = useGenericExport(EXPORT_CONFIG)
	const [exportDateFilters, setExportDateFilters] = useState<DateFilters>({})

	const supplierData = recordsData?.data?.items ?? []
	const hasRecords = supplierData.length > 0

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[], dateFilters?: DateFilters) => {
		let dataToExport = supplierData

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

		await exportData(dataToExport, format, selectedColumns)
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

	return (
		<ModuleHeader
			title='Marcas'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={supplierData}
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

					<CreateButton
						onClick={onCreateClick}
						config={{
							text: 'Nueva marca',
							icon: <Icons.plus />,
							size: 'lg',
							disabled: loading,
						}}
					/>
				</>
			}
		/>
	)
}
