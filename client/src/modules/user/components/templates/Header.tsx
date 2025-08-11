'use client'

import { Icons } from '@/components/icons'
import { I_Role } from '@/common/types/roles'
import { useUser } from '@/common/hooks/useUser'
import { I_Status } from '@/common/types/modules/user'
import { formatDate } from '@/common/utils/dateFormater-util'
import { ExportButton } from '@/components/layout/organims/ExportButton'
import { CreateButton } from '@/components/layout/organims/CreateButton'
import { ModuleHeader } from '@/components/layout/templates/ModuleHeader'
import { useGenericExport } from '@/common/hooks/shared/useGenericExport'
import { translateRoleName, translateStatusName } from '@/common/utils/traslate.util'

interface UserHeaderProps {
	onCreateClick: () => void
}

// Helper para formatear imágenes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatImageValue = (value: any): string => {
	if (!value) return 'Sin imagen'
	if (typeof value === 'object' && value !== null) {
		const imageUrl = value.url || value.src || value.path || value.href
		return imageUrl && typeof imageUrl === 'string' ? imageUrl : 'Imagen disponible'
	}
	if (typeof value === 'string') return value
	return 'Formato de imagen no válido'
}

// Configuración de exportación para Usuarios
const EXPORT_CONFIG = {
	fileName: 'usuarios',
	reportTitle: 'Reporte de Usuarios',
	columnLabels: {
		email: 'Correo electrónico',
		firstName: 'Nombre',
		lastName: 'Apellido',
		role: 'Rol',
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

export function UserHeader({ onCreateClick }: UserHeaderProps) {
	const { recordsData, loading } = useUser()

	const totalRecords = recordsData?.data?.pagination?.totalRecords || 0
	const userData = recordsData?.data?.items || []

	const { exportData } = useGenericExport(EXPORT_CONFIG)

	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await exportData(userData, format, selectedColumns)

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
							text: 'Nuevo usuario',
							icon: <Icons.plus />,
							size: 'lg',
						}}
					/>
				</>
			}
		/>
	)
}
