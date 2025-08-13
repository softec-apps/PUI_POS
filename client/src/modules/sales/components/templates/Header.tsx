'use client'

import { Icons } from '@/components/icons'
import { useSale } from '@/common/hooks/useSale'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface SalesHeaderProps {
	onCreateClick: () => void
}

const EXPORT_CONFIG = {
	fileName: 'ventas',
	reportTitle: 'Reporte de Ventas',
	columnLabels: {
		id: 'ID',
		customer: 'Cliente',
		seller: 'Vendedor',
		total: 'Total',
		status: 'Estado',
		createdAt: 'Fecha de Creación',
	},
	columnMappings: {
		status: {
			type: 'enum' as const,
			valueMap: {
				completed: 'Completado',
				pending: 'Pendiente',
				cancelled: 'Cancelado',
			},
		},
		createdAt: {
			type: 'date' as const,
			format: (value: string) => formatDate(value, true),
		},
        customer: {
            type: 'object' as const,
            format: (value: any) => value?.firstName + ' ' + value?.lastName,
        },
        seller: {
            type: 'object' as const,
            format: (value: any) => value?.name,
        }
	},
	pdfConfig: {
		orientation: 'landscape' as const,
		headerColor: [45, 45, 45] as const,
		groupDateAtColumns: false,
	},
	excludeColumns: ['__typename', 'updatedAt', 'items'],
	columnGroups: {
		basic: ['id', 'customer', 'seller', 'total', 'status'],
		dates: ['createdAt'],
	},
	customGroupConfig: {
		basic: {
			label: 'Información General',
			icon: <Icons.infoCircle className='h-4 w-4' />,
		},
		dates: {
			label: 'Fechas y Auditoría',
			icon: <Icons.calendar className='h-4 w-4' />,
		},
	},
	columnTypes: {
		id: 'text' as const,
		customer: 'text' as const,
		seller: 'text' as const,
		total: 'number' as const,
		status: 'text' as const,
		createdAt: 'date' as const,
	},
}

export function SalesHeader({ onCreateClick }: SalesHeaderProps) {
	const { sales: recordsData, loading } = useSale()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const salesData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(salesData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Ventas'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={salesData}
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
							text: 'Nueva Venta',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
