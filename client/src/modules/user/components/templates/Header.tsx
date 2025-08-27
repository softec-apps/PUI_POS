'use client'

import { useCallback, useState } from 'react'
import { useUser } from '@/common/hooks/useUser'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'
import { I_Role } from '@/common/types/roles'
import { I_Status } from '@/common/types/modules/user'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'
import { formatDate } from '@/common/utils/dateFormater-util'
import { translateRoleName, translateStatusName } from '@/common/utils/traslate.util'
import { Icons } from '@/components/icons'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { formatImageValue } from '@/common/utils/formatImageValue-util'

interface UserHeaderProps {
	onCreateClick: () => void
	onRefresh: () => void
	totalRecords: number
}

const EXPORT_CONFIG = {
	fileName: 'usuarios',
	reportTitle: 'Reporte de Usuarios',
	columnLabels: {
		email: 'Correo electrónico',
		firstName: 'Nombre',
		lastName: 'Apellido',
		role: 'Rol',
		dni: 'Cédula',
		status: 'Estado',
		photo: 'Imagen',
		createdAt: 'Fecha de Creación',
		updatedAt: 'Última Actualización',
		deletedAt: 'Fecha de Eliminación',
	},
	columnMappings: {
		role: {
			type: 'enum' as const,
			format: (value: I_Role) => translateRoleName(value?.name),
		},
		status: {
			type: 'enum' as const,
			format: (value: I_Status) => translateStatusName(value?.name),
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
		photo: {
			type: 'image' as const,
			format: formatImageValue,
		},
	},
	pdfConfig: {
		orientation: 'landscape' as const,
		headerColor: [45, 45, 45] as const,
		groupDateAtColumns: false,
	},
	excludeColumns: ['__typename', 'id', 'provider', 'socialId'],
	columnGroups: {
		basic: ['email', 'firstName', 'lastName'],
		role: ['role'],
		status: ['status'],
		media: ['photo'],
		dates: ['createdAt', 'updatedAt', 'deletedAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Datos Personales',
			icon: <Icons.user className='h-4 w-4' />,
		},
		role: {
			label: 'Rol',
			icon: <Icons.circles className='h-4 w-4' />,
		},
		status: {
			label: 'Estado',
			icon: <Icons.checkCircle className='h-4 w-4' />,
		},
		media: {
			label: 'Multimedia',
			icon: <Icons.media className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		email: 'text' as const,
		firstName: 'text' as const,
		lastName: 'text' as const,
		role: 'text' as const,
		status: 'text' as const,
		photo: 'image' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
		deletedAt: 'date' as const,
	},
}

export function UserHeader({ onCreateClick, onRefresh, totalRecords }: UserHeaderProps) {
	const { recordsData, loading } = useUser({ limit: 9999 })
	const { exportData } = useGenericExport(EXPORT_CONFIG)
	const [exportDateFilters, setExportDateFilters] = useState<DateFilters>({})

	const userData = recordsData?.data?.items ?? []
	const hasRecords = userData.length > 0

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[], dateFilters?: DateFilters) => {
		let dataToExport = userData

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
			title='Usuarios'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={userData}
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
							text: 'Nuevo usuario',
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
