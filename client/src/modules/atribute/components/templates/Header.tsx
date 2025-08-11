'use client'

import { Icons } from '@/components/icons'
import { useAttribute } from '@/common/hooks/useAttribute'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface AttributeHeaderProps {
	onCreateClick: () => void
}

const EXPORT_CONFIG = {
	fileName: 'atributos',
	reportTitle: 'Reporte de Atributos',
	columnLabels: {
		name: 'Nombre',
		type: 'Tipo',
		options: 'Opciones',
		required: 'Requerido',
		createdAt: 'Fecha de Creación',
		updatedAt: 'Última Actualización',
	},
	columnMappings: {
		type: {
			type: 'enum' as const,
			valueMap: {
				text: 'Texto',
				number: 'Número',
				color: 'Color',
				select: 'Selección',
				multiselect: 'Multiselección',
				boolean: 'Booleano',
			},
		},
		required: {
			type: 'enum' as const,
			valueMap: {
				true: 'Sí',
				false: 'No',
			},
		},
		options: {
			type: 'array' as const,
			format: (value: string[]) => value.join(', '),
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
	excludeColumns: ['__typename', 'id'],
	columnGroups: {
		basic: ['name', 'type', 'required'],
		options: ['options'],
		dates: ['createdAt', 'updatedAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información Básica',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		options: {
			label: 'Opciones',
			icon: <Icons.list className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		name: 'text' as const,
		type: 'text' as const,
		options: 'text' as const,
		required: 'text' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
	},
}

export function AtributeHeader({ onCreateClick }: AttributeHeaderProps) {
	const { attributes: recordsData, loading } = useAttribute()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const attributeData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(attributeData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Atributos'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={attributeData}
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
							text: 'Nuevo atributo',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
