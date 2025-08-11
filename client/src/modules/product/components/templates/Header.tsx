'use client'

import { Icons } from '@/components/icons'
import { useProduct } from '@/common/hooks/useProduct'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface ProductHeaderProps {
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

const EXPORT_CONFIG = {
	fileName: 'productos',
	reportTitle: 'Reporte de Productos',
	columnLabels: {
		status: 'Estado',
		code: 'Código',
		name: 'Nombre',
		description: 'Descripción',
		price: 'Precio base',
		barCode: 'Código de barras',
		stock: 'Stock',
		photo: 'Imagen',
		category: 'Categoría',
		brand: 'Marca',
		supplier: 'Proveedor',
		createdAt: 'Fecha de Creación',
		updatedAt: 'Última Actualización',
		deletedAt: 'Fecha de Eliminación',
	},
	columnMappings: {
		status: {
			type: 'enum' as const,
			valueMap: {
				draft: 'Borrador',
				active: 'Activo',
				inactive: 'Inactivo',
				discontinued: 'Descontinuado',
				out_of_stock: 'Agotado',
			},
		},
		photo: {
			type: 'image' as const,
			format: (value: any) => formatImageValue(value?.path),
		},
		category: {
			type: 'text' as const,
			format: (value: any) => value?.name ?? 'Sin categoría',
		},
		brand: {
			type: 'text' as const,
			format: (value: any) => value?.name ?? 'Sin marca',
		},
		supplier: {
			type: 'text' as const,
			format: (value: any) => value?.legalName ?? 'Sin proveedor',
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
			format: (value: string) => (value ? formatDate(value, true) : ''),
		},
	},
	pdfConfig: {
		orientation: 'landscape' as const,
		headerColor: [45, 45, 45] as const,
		groupDateAtColumns: false,
	},
	excludeColumns: ['__typename', 'id', 'isVariant', 'sku', 'template'],
	columnGroups: {
		basic: ['name', 'description', 'price', 'stock'],
		status: ['status'],
		media: ['photo'],
		relations: ['category', 'brand', 'supplier'],
		dates: ['createdAt', 'updatedAt', 'deletedAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información General',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		status: {
			label: 'Estado',
			icon: <Icons.circles className='h-4 w-4' />,
		},
		media: {
			label: 'Multimedia',
			icon: <Icons.media className='h-4 w-4' />,
		},
		relations: {
			label: 'Relaciones',
			icon: <Icons.link className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		name: 'text' as const,
		description: 'text' as const,
		price: 'number' as const,
		stock: 'number' as const,
		status: 'text' as const,
		photo: 'image' as const,
		category: 'text' as const,
		brand: 'text' as const,
		supplier: 'text' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
		deletedAt: 'date' as const,
	},
}

export function ProductHeader({ onCreateClick }: ProductHeaderProps) {
	const { recordsData, loading } = useProduct()

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
			title='Productos'
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
							text: 'Nuevo producto',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
