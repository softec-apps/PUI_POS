'use client'

import { ExportReport } from '@/components/layout/organims/ExportDialog'

interface ExportButtonProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any[]
	totalRecords: number
	loading: boolean
	onExport: (format: 'xlsx' | 'pdf', selectedColumns?: string[]) => Promise<void>

	// Configuración del botón
	config?: {
		text?: string
		size?: 'sm' | 'lg'
		variant?: 'default' | 'ghost' | 'secondary'
		disabled?: boolean
	}

	// Configuración desde useGenericExport + agrupación
	exportConfig?: {
		columnLabels?: Record<string, string>
		columnTypes?: Record<string, 'text' | 'number' | 'date' | 'boolean'>
		excludeColumns?: string[]

		// NUEVO: Configuración de grupos
		columnGroups?: Record<string, string[]>
		customGroupConfig?: Record<string, { label: string; icon?: React.ReactNode }>
	}
}

export function ExportButton({
	data,
	totalRecords,
	loading,
	onExport,
	config = {
		text: 'Exportar',
		size: 'lg',
		variant: 'ghost',
	},
	exportConfig = {},
}: ExportButtonProps) {
	return (
		<ExportReport
			title={config.text}
			onExport={onExport}
			data={data}
			size={config.size}
			variant={config.variant}
			disabled={loading || totalRecords === 0 || config.disabled}
			columnLabels={exportConfig.columnLabels}
			columnTypes={exportConfig.columnTypes}
			excludeColumns={exportConfig.excludeColumns}
			columnGroups={exportConfig.columnGroups}
			customGroupConfig={exportConfig.customGroupConfig}
		/>
	)
}
