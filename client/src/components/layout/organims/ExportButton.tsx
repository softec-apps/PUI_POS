'use client'

import React from 'react'
import { ExportReport } from '@/components/layout/organims/ExportDialog'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'

interface ExportButtonProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any[]
	totalRecords: number
	loading: boolean
	onExport: (format: 'xlsx' | 'pdf', selectedColumns?: string[], dateFilters?: DateFilters) => Promise<void>
	onSheetOpen?: () => Promise<void>

	config?: {
		text?: string
		size?: 'sm' | 'lg'
		variant?: 'default' | 'ghost' | 'secondary'
		disabled?: boolean
	}

	exportConfig?: {
		columnLabels?: Record<string, string>
		columnTypes?: Record<string, 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage'>
		excludeColumns?: string[]
		columnGroups?: Record<string, string[]>
		customGroupConfig?: Record<string, { label: string; icon?: React.ReactNode }>
	}

	dateFiltersConfig?: {
		enabled?: boolean
		defaultFilters?: DateFilters
		availableFilters?: DateFilterType[]
		onDateFilterChange?: (filterType: DateFilterType, range: DateRange) => void
		onClearDateFilter?: (filterType: DateFilterType) => void
	}
}

export function ExportButton({
	data,
	totalRecords,
	loading,
	onExport,
	onSheetOpen,
	config = {
		text: 'Exportar',
		size: 'lg',
		variant: 'ghost',
	},
	exportConfig = {},
	dateFiltersConfig = {
		enabled: false,
	},
}: ExportButtonProps) {
	const [dateFilters, setDateFilters] = React.useState<DateFilters>(dateFiltersConfig.defaultFilters || {})

	const shouldDisable = loading || totalRecords === 0 || data.length === 0 || config.disabled

	const handleSheetOpen = async () => {
		if (onSheetOpen) await onSheetOpen()
	}

	// Manejar cambios en filtros de fecha
	const handleDateFilterChange = (filterType: DateFilterType, range: DateRange) => {
		setDateFilters(prev => ({
			...prev,
			[filterType]: range,
		}))

		dateFiltersConfig.onDateFilterChange?.(filterType, range)
	}

	const handleClearDateFilter = (filterType: DateFilterType) => {
		setDateFilters(prev => {
			const updated = { ...prev }
			delete updated[filterType]
			return updated
		})

		dateFiltersConfig.onClearDateFilter?.(filterType)
	}

	const handleClearAllDateFilters = () => {
		setDateFilters({})
		Object.keys(dateFilters).forEach(filterType => dateFiltersConfig.onClearDateFilter?.(filterType as DateFilterType))
	}

	// Filtrar datos según el rango de fechas seleccionado
	const getFilteredData = () => {
		if (!dateFiltersConfig.enabled || Object.keys(dateFilters).length === 0) return data

		return data.filter(item => {
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

	// Wrapper para onExport que incluye los filtros
	const handleExport = async (format: 'xlsx' | 'pdf', selectedColumns?: string[]) =>
		await onExport(format, selectedColumns, dateFilters)

	const filteredData = getFilteredData()
	const hasActiveFilters = Object.keys(dateFilters).length > 0

	return (
		<ExportReport
			title={config.text}
			onExport={handleExport}
			onSheetOpen={handleSheetOpen}
			data={filteredData}
			size={config.size}
			variant={config.variant}
			disabled={shouldDisable}
			columnLabels={exportConfig.columnLabels}
			columnTypes={exportConfig.columnTypes}
			excludeColumns={exportConfig.excludeColumns}
			columnGroups={exportConfig.columnGroups}
			customGroupConfig={exportConfig.customGroupConfig}
			dateFiltersEnabled={dateFiltersConfig.enabled}
			dateFilters={dateFilters}
			onDateFilterChange={handleDateFilterChange}
			onClearDateFilter={handleClearDateFilter}
			onClearAllDateFilters={handleClearAllDateFilters}
			hasActiveFilters={hasActiveFilters}
			originalDataCount={totalRecords}
			filteredDataCount={filteredData.length}
		/>
	)
}
