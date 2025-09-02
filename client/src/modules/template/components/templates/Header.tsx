'use client'

import { Icons } from '@/components/icons'
import { useTemplate } from '@/common/hooks/useTemplate'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface TemplateHeaderProps {
	onCreateClick: () => void
}

const EXPORT_CONFIG = {
	fileName: 'plantillas',
	reportTitle: 'Reporte de Plantillas',
	columnLabels: {
		name: 'Nombre',
		description: 'Descripción',
		'category.name': 'Categoría',
		atributes: 'Atributos',
		createdAt: 'Fecha de Creación',
		updatedAt: 'Última Actualización',
	},
	columnMappings: {
		atributes: {
			type: 'array' as const,
			format: (value: any[]) => value.map(attr => attr.name).join(', '),
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
	columnGroups: {
		basic: ['name', 'description', 'category.name'],
		attributes: ['atributes'],
		dates: ['createdAt', 'updatedAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información Básica',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		attributes: {
			label: 'Atributos',
			icon: <Icons.list className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		name: 'text' as const,
		description: 'text' as const,
		'category.name': 'text' as const,
		atributes: 'text' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
	},
}

export function TemplateHeader({ onCreateClick }: TemplateHeaderProps) {
	const { template: recordsData, loading } = useTemplate()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const templateData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(templateData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Plantillas'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={templateData}
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
							text: 'Nueva plantilla',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
