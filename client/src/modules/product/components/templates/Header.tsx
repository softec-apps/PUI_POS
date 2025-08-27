'use client'

import { useState, useCallback } from 'react'
import { Icons } from '@/components/icons'
import { useProduct } from '@/common/hooks/useProduct'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'
import { ImportButton } from '@/components/layout/organims/ImportButton'
import { BulkImportModal } from '@/modules/product/components/organisms/BulkImportModal'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'

// Configuración compartida de exportación
const formatImageValue = (value: any): string => {
	if (!value) return 'Sin imagen'

	if (typeof value === 'object' && value !== null) {
		const imageUrl = value.url || value.src || value.path || value.href
		return imageUrl && typeof imageUrl === 'string' ? imageUrl : 'Imagen disponible'
	}

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

// COMPONENTE 1: Acción de Exportar
interface ProductExportActionProps {
	data?: any[]
	totalRecords?: number
	loading?: boolean
	onRefresh?: () => void
	config?: {
		text?: string
		size?: 'sm' | 'md' | 'lg'
		variant?: 'default' | 'ghost' | 'secondary'
		disabled?: boolean
	}
	dateFiltersConfig?: {
		enabled?: boolean
		defaultFilters?: DateFilters
		availableFilters?: string[]
		onDateFilterChange?: (filterType: DateFilterType, range: DateRange) => void
		onClearDateFilter?: (filterType: DateFilterType) => void
	}
}

export function ProductExportAction({
	data,
	totalRecords = 0,
	loading = false,
	onRefresh,
	config = {},
	dateFiltersConfig = {},
}: ProductExportActionProps) {
	const { recordsData } = useProduct({ limit: 9999 })
	const { exportData } = useGenericExport(EXPORT_CONFIG)
	const [exportDateFilters, setExportDateFilters] = useState<DateFilters>(dateFiltersConfig.defaultFilters || {})

	const productData = data || recordsData?.data?.items || []
	const hasRecords = productData.length > 0

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[], dateFilters?: DateFilters) => {
		let dataToExport = productData

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
		dateFiltersConfig.onDateFilterChange?.(filterType, range)
	}

	const handleClearDateFilter = (filterType: DateFilterType) => {
		setExportDateFilters(prev => {
			const updated = { ...prev }
			delete updated[filterType]
			return updated
		})
		dateFiltersConfig.onClearDateFilter?.(filterType)
	}

	const handleExportSheetOpen = useCallback(async () => onRefresh?.(), [onRefresh])

	return (
		<ExportButton
			data={productData}
			totalRecords={totalRecords}
			loading={loading}
			onExport={handleExport}
			onSheetOpen={handleExportSheetOpen}
			config={{
				text: 'Exportar',
				size: 'lg',
				variant: 'ghost',
				disabled: !hasRecords || loading,
				...config,
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
				availableFilters: ['createdAt', 'updatedAt'],
				onDateFilterChange: handleDateFilterChange,
				onClearDateFilter: handleClearDateFilter,
				...dateFiltersConfig,
			}}
		/>
	)
}

// COMPONENTE 2: Acción de Importar
interface ProductImportActionProps {
	loading?: boolean
	onSuccess?: () => void
	config?: {
		text?: string
		icon?: React.ReactNode
		size?: 'sm' | 'md' | 'lg'
		variant?: 'default' | 'ghost' | 'secondary'
		disabled?: boolean
	}
}

export function ProductImportAction({ loading = false, onSuccess, config = {} }: ProductImportActionProps) {
	const [importModalOpen, setImportModalOpen] = useState(false)

	const handleImportSuccess = () => {
		setImportModalOpen(false)
		onSuccess?.()
	}

	return (
		<>
			<ImportButton
				onClick={() => setImportModalOpen(true)}
				config={{
					text: 'Importar',
					icon: <Icons.cloudUpload className='h-4 w-4' />,
					size: 'lg',
					variant: 'secondary',
					disabled: loading,
					...config,
				}}
			/>
			<BulkImportModal open={importModalOpen} onOpenChange={setImportModalOpen} onSuccess={handleImportSuccess} />
		</>
	)
}

// COMPONENTE 3: Acción de Crear
interface ProductCreateActionProps {
	onClick: () => void
	loading?: boolean
	config?: {
		text?: string
		icon?: React.ReactNode
		size?: 'sm' | 'md' | 'lg'
		variant?: 'default' | 'ghost' | 'secondary'
		disabled?: boolean
	}
}

export function ProductCreateAction({ onClick, loading = false, config = {} }: ProductCreateActionProps) {
	return (
		<CreateButton
			onClick={onClick}
			config={{
				text: 'Nuevo producto',
				icon: <Icons.plus />,
				size: 'lg',
				disabled: loading,
				...config,
			}}
		/>
	)
}

// COMPONENTE 4: Header refactorizado usando las acciones separadas
interface ProductHeaderProps {
	onCreateClick: () => void
	onRefresh: () => void
	totalRecords: number
	showActionCreate?: boolean
	showActionImport?: boolean
	showActionExport?: boolean
}

export function ProductHeader({
	onCreateClick,
	onRefresh,
	totalRecords,
	showActionCreate = true,
	showActionExport = true,
	showActionImport = true,
}: ProductHeaderProps) {
	const { loading } = useProduct({ limit: 9999 })

	return (
		<ModuleHeader
			title='Productos'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					{showActionExport && (
						<ProductExportAction totalRecords={totalRecords} loading={loading} onRefresh={onRefresh} />
					)}

					{showActionImport && <ProductImportAction loading={loading} onSuccess={onRefresh} />}

					{showActionCreate && <ProductCreateAction onClick={onCreateClick} loading={loading} />}
				</>
			}
		/>
	)
}

// COMPONENTE 5: Grupo de acciones personalizable
interface ProductActionsGroupProps {
	onCreateClick?: () => void
	onRefresh?: () => void
	totalRecords?: number
	loading?: boolean
	data?: any[]
	actions?: {
		export?: boolean | ProductExportActionProps
		import?: boolean | ProductImportActionProps
		create?: boolean | ProductCreateActionProps
	}
	className?: string
}

export function ProductActionsGroup({
	onCreateClick,
	onRefresh,
	totalRecords = 0,
	loading = false,
	data,
	actions = {},
	className,
}: ProductActionsGroupProps) {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			{actions.export && (
				<ProductExportAction
					data={data}
					totalRecords={totalRecords}
					loading={loading}
					onRefresh={onRefresh}
					{...(typeof actions.export === 'object' ? actions.export : {})}
				/>
			)}

			{actions.import && (
				<ProductImportAction
					loading={loading}
					onSuccess={onRefresh}
					{...(typeof actions.import === 'object' ? actions.import : {})}
				/>
			)}

			{actions.create && onCreateClick && (
				<ProductCreateAction
					onClick={onCreateClick}
					loading={loading}
					{...(typeof actions.create === 'object' ? actions.create : {})}
				/>
			)}
		</div>
	)
}
