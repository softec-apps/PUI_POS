'use client'
import { Icons } from '@/components/icons'
import { useSupplier } from '@/common/hooks/useSupplier'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface SupplierHeaderProps {
	onCreateClick: () => void
}

// Configuración de exportación separada para mejor mantenibilidad
const EXPORT_CONFIG = {
	fileName: 'Proveedores',
	reportTitle: 'Reporte de Proveedores',
	columnLabels: {
		ruc: 'RUC',
		legalName: 'Nombre legal',
		commercialName: 'Nombre comercial',
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
		basic: ['ruc', 'legalName', 'commercialName'],
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
		ruc: 'text' as const,
		legalName: 'text' as const,
		commercialName: 'text' as const,
		status: 'text' as const,
		createdAt: 'date' as const,
		updatedAt: 'date' as const,
		deletedAt: 'date' as const,
	},
}

export function SupplierHeader({ onCreateClick }: SupplierHeaderProps) {
	const { supplierData, loading } = useSupplier()

	// Datos derivados
	const totalRecords = supplierData?.data?.pagination?.totalRecords || 0
	const recordsData = supplierData?.data?.items || []

	// Hook de exportación con configuración separada
	const { exportData } = useGenericExport(EXPORT_CONFIG)

	// Handler de exportación simplificado
	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(recordsData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Proveedores' // Corregido: era 'Categorías'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={recordsData}
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
							text: 'Nuevo proveedor', // Corregido: era 'Nueva proveedor'
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
