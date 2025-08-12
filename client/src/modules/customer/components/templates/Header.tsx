'use client'

import { Icons } from '@/components/icons'
import { useCustomer } from '@/common/hooks/useCustomer'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'

interface CustomerHeaderProps {
	onCreateClick: () => void
}

const EXPORT_CONFIG = {
	fileName: 'clientes',
	reportTitle: 'Reporte de Clientes',
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
                'regular': 'Regular',
                'final_consumer': 'Consumidor Final',
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
	},
	excludeColumns: ['__typename', 'id', 'deletedAt'],
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

export function CustomerHeader({ onCreateClick }: CustomerHeaderProps) {
	const { recordsData, loading } = useCustomer()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const customerData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(customerData, format, selectedColumns)

	return (
		<ModuleHeader
			title='Clientes'
			totalRecords={totalRecords}
			loading={loading}
			actionContent={
				<>
					<ExportButton
						data={customerData}
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
