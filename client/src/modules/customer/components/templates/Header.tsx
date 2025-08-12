'use client'

import { Icons } from '@/components/icons'
import { useCategory } from '@/common/hooks/useCategory'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface CustomerHeaderProps {
	onCreateClick: () => void
}

// Función helper para formatear imágenes
const formatImageValue = (value: any): string => {
	if (!value) return 'Sin imagen'

	// Si es un objeto, intentar extraer la URL
	if (typeof value === 'object' && value !== null) {
		const imageUrl = value.url || value.src || value.path || value.href
		return imageUrl && typeof imageUrl === 'string' ? imageUrl : 'Imagen disponible'
	}

	// Si ya es una string (URL), devolverla tal como está
	if (typeof value === 'string') return value

	return 'Formato de imagen no válido'
}

// Configuración de exportación separada para mejor mantenibilidad
const EXPORT_CONFIG = {
	fileName: 'categorias',
	reportTitle: 'Reporte de Categorías',
	columnLabels: {
		name: 'Nombre',
		description: 'Descripción',
		status: 'Estado',
		photo: 'Imagen',
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
	excludeColumns: ['__typename', 'id'],
	// Configuración de grupos de columnas
	columnGroups: {
		basic: ['name', 'description'],
		status: ['status'],
		media: ['photo'],
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
		name: 'text' as const,
		description: 'text' as const,
		status: 'text' as const,
		photo: 'image' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
		deletedAt: 'date' as const,
	},
}

export function CustomerHeader({ onCreateClick }: CustomerHeaderProps) {
	const { categories: recordsData, loading } = useCategory()

	// Datos derivados
	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const categoryData = recordsData?.data?.items || []

	// Hook de exportación con configuración separada
	const { exportData } = useGenericExport(EXPORT_CONFIG)

	// Handler de exportación simplificado
	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(categoryData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Clientes'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={categoryData}
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
							text: 'Nuevo cliente',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
