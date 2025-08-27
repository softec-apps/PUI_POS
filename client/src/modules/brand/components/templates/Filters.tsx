'use client'

import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { Icons } from '@/components/icons'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ViewSelector } from '@/components/layout/organims/ViewSelector'
import { SearchInput } from '@/components/layout/organims/SearchInput'
import { SortDropdown } from '@/modules/brand/components/organisms/Filters/SortDropdown'
import { StatusDropdown } from '@/modules/brand/components/organisms/Filters/StatusDropdown'
import { DateFiltersDropdown } from '@/modules/brand/components/organisms/Filters/DateFiltersDropdown'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'

interface FiltersProps {
	searchValue: string
	isRefreshing: boolean
	currentSort?: string
	currentStatus?: 'active' | 'inactive' | null
	dateFilters: DateFilters
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onSort: (sortKey: string) => void
	onStatusChange: (status: 'active' | 'inactive' | null) => void
	onDateFilterChange: (filterType: DateFilterType, range: DateRange) => void
	onClearDateFilter: (filterType: DateFilterType) => void
	onRefresh: () => void
	onResetAll: () => void
	viewType: ViewType
	onViewChange: (type: ViewType) => void
}

export function Filters({
	searchValue,
	isRefreshing,
	currentSort,
	currentStatus,
	dateFilters,
	onSearchChange,
	onSort,
	onStatusChange,
	onDateFilterChange,
	onClearDateFilter,
	onRefresh,
	viewType,
	onViewChange,
}: FiltersProps) {
	const [isMounted, setIsMounted] = useState(false)
	useEffect(() => setIsMounted(true), [])

	// Función para limpiar ordenamiento
	const clearSort = () => onSort('')

	// Función para limpiar estado
	const clearStatus = () => onStatusChange(null)

	// Función para limpiar todas las fechas
	const clearAllDateFilters = () => Object.keys(dateFilters).forEach(key => onClearDateFilter(key as DateFilterType))

	if (!isMounted) return null

	return (
		<div className='space-y-4'>
			{/* Main Filters Container */}
			<div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				{/* Left Side - Search and View */}
				<motion.div
					className='items-center gap-2 space-y-4 sm:flex sm:space-y-0'
					initial={{ opacity: 0, x: -15 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0 }}>
					<SearchInput value={searchValue} onChange={onSearchChange} />
					<ViewSelector currentView={viewType} onViewChange={onViewChange} />
				</motion.div>

				{/* Right Side - Actions */}
				<motion.div
					className='flex items-center gap-2'
					initial={{ opacity: 0, x: 15 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0 }}>
					<div className='relative flex items-center gap-2'>
						<SortDropdown currentSort={currentSort} onSort={onSort} />
						{currentSort && currentSort !== '' && (
							<ActionButton icon={<Icons.x />} onClick={clearSort} variant='ghost' size='sm' className='h-8 w-8' />
						)}
					</div>

					<span className='text-muted-foreground'>|</span>

					<div className='relative flex items-center gap-2'>
						<StatusDropdown currentStatus={currentStatus} onStatusChange={onStatusChange} />
						{currentStatus !== null && (
							<ActionButton icon={<Icons.x />} onClick={clearStatus} variant='ghost' size='sm' className='h-8 w-8' />
						)}
					</div>

					<div className='relative flex items-center gap-2'>
						<DateFiltersDropdown
							dateFilters={dateFilters}
							onDateFilterChange={onDateFilterChange}
							onClearDateFilter={onClearDateFilter}
						/>
						{Object.values(dateFilters).some(range => range && (range.startDate || range.endDate)) && (
							<ActionButton
								icon={<Icons.x />}
								onClick={clearAllDateFilters}
								variant='ghost'
								size='sm'
								className='h-8 w-8'
							/>
						)}
					</div>

					<span className='text-muted-foreground'>|</span>

					<ActionButton
						icon={isRefreshing ? <Icons.refresh className='animate-spin' /> : <Icons.refresh />}
						onClick={onRefresh}
						disabled={isRefreshing}
						text={isRefreshing ? 'Refrescando...' : 'Refrescar'}
						variant='secondary'
					/>
				</motion.div>
			</div>
		</div>
	)
}
