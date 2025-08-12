'use client'

import { Icons } from '@/components/icons'
import { useBrand } from '@/common/hooks/useBrand'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface BrandHeaderProps {
	onCreateClick: () => void
}

const EXPORT_CONFIG = {
	fileName: 'marcas',
	reportTitle: 'Reporte de Marcas',
	columnLabels: {
		name: 'Nombre',
		description: 'Descripción',
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

export function BrandHeader({ onCreateClick }: BrandHeaderProps) {
	const { brands: recordsData, loading } = useBrand()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const brandData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(brandData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Marcas'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={brandData}
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
					<CreateButton
						onClick={onCreateClick}
						config={{
							text: 'Nueva marca',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
