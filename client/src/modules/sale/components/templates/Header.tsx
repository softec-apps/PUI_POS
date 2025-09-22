'use client'

import { Icons } from '@/components/icons'
import { useCallback, useState } from 'react'
import { useSale } from '@/common/hooks/useSale'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'
import { SalesDrawer } from './SalesDrawer'

interface HeaderProps {
	onRefresh: () => void
	totalRecords: number
}

// Configuración de exportación separada para mejor mantenibilidad
const EXPORT_CONFIG = {
	fileName: 'ventas',
	reportTitle: 'Reporte de Ventas',
	columnLabels: {
		firstName: 'Nombres',
		lastName: 'Apellidos',
		email: 'Email',
		phone: 'Teléfono',
		address: 'Dirección',
		identificationType: 'Tipo ID',
		identificationNumber: 'No. ID',
		customerType: 'Tipo Cliente',
		createdAt: 'Fecha de Creación',
		updatedAt: 'Última Actualización',
	},
	columnMappings: {
		identificationType: {
			type: 'enum' as const,
			valueMap: {
				'04': 'RUC',
				'05': 'Cédula',
				'06': 'Pasaporte',
				'07': 'Consumidor Final',
			},
		},
		customerType: {
			type: 'enum' as const,
			valueMap: {
				regular: 'Regular',
				final_consumer: 'Consumidor Final',
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
	},
	pdfConfig: {
		orientation: 'landscape' as const,
		headerColor: [45, 45, 45] as const,
		groupDateAtColumns: false,
	},
	excludeColumns: ['__typename', 'id', 'deletedAt'],
	// Configuración de grupos de columnas
	columnGroups: {
		basic: ['firstName', 'lastName', 'email', 'phone', 'address'],
		identification: ['identificationType', 'identificationNumber', 'customerType'],
		dates: ['createdAt', 'updatedAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información Personal',
			icon: <Icons.user className='h-4 w-4' />,
		},
		identification: {
			label: 'Identificación',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		firstName: 'text' as const,
		lastName: 'text' as const,
		email: 'text' as const,
		phone: 'text' as const,
		address: 'text' as const,
		identificationType: 'text' as const,
		identificationNumber: 'text' as const,
		customerType: 'text' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
	},
}

export function Header({ onRefresh, totalRecords }: HeaderProps) {
	const { recordsData, loading } = useSale({ limit: 9999 })
	const { exportData } = useGenericExport(EXPORT_CONFIG)
	const [exportDateFilters, setExportDateFilters] = useState<DateFilters>({})

	const consumerData = recordsData?.data?.items ?? []
	const hasRecords = consumerData.length > 0

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[], dateFilters?: DateFilters) => {
		let dataToExport = consumerData

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
			title='Ventas'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={consumerData}
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
					<SalesDrawer />
				</>
			}
		/>
	)
}
