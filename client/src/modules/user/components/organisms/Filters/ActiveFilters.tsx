'use client'

import { Sparkles } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { SORT_OPTIONS } from '@/modules/user/constants/user.constants'
import { DateFilters, DateFilterType } from '@/common/types/pagination'
import { Calendar } from '@/components/ui/calendar'

interface ActiveFiltersProps {
	searchValue: string
	currentSort?: string
	currentStatus?: '1' | '2' | ''
	dateFilters: DateFilters
	activeFiltersCount: number
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onSort: (sortKey: string) => void
	onStatusChange: (status: '1' | '2' | '') => void
	onClearDateFilter: (filterType: DateFilterType) => void
	onResetAll: () => void
}

const DATE_FILTER_LABELS = {
	createdAt: 'Creación',
	updatedAt: 'Actualización',
	deletedAt: 'Eliminación',
}

export function ActiveFilters({
	searchValue,
	currentSort,
	currentStatus,
	dateFilters,
	activeFiltersCount,
	onSearchChange,
	onSort,
	onStatusChange,
	onClearDateFilter,
	onResetAll,
}: ActiveFiltersProps) {
	const clearSearch = () => {
		onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
	}

	const getCurrentSortLabel = () => {
		if (!currentSort) return 'Ordenar'
		const sortOption = SORT_OPTIONS.find(option => option.key === currentSort)
		return sortOption?.label || 'Ordenar'
	}

	const getCurrentStatusLabel = () => {
		if (!currentStatus) return 'Filtro'
		const statusLabels = {
			active: '1',
			inactive: '2',
		}
		return statusLabels[currentStatus] || 'Filtro'
	}

	const formatDateRange = (range: { startDate?: string; endDate?: string }) => {
		const start = range.startDate ? dayjs(range.startDate).locale('es').format('DD/MM/YYYY') : ''
		const end = range.endDate ? dayjs(range.endDate).locale('es').format('DD/MM/YYYY') : ''

		if (start && end) return `${start} - ${end}`
		if (start) return `Desde ${start}`
		if (end) return `Hasta ${end}`
		return ''
	}

	const activeDateFilters = Object.entries(dateFilters).filter(
		([_, range]) => range && (range.startDate || range.endDate)
	)

	return (
		<AnimatePresence>
			{activeFiltersCount > 0 && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.2 }}
					className='overflow-hidden'>
					<div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
						<div className='flex flex-wrap items-center gap-2'>
							<span className='text-muted-foreground flex items-center gap-2 text-sm'>
								<Sparkles className='h-4 w-4' /> Filtros activos:
							</span>

							{searchValue && (
								<Badge
									variant='secondary'
									className='cursor-pointer gap-1.5 rounded-lg py-1 pr-1 pl-2'
									onClick={clearSearch}>
									<Icons.search className='h-3 w-3' />
									<span className='max-w-[120px] truncate'>{searchValue}</span>
									<button
										onClick={clearSearch}
										className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
										<Icons.x className='h-3 w-3' />
									</button>
								</Badge>
							)}

							{currentSort && (
								<Badge
									variant='secondary'
									className='cursor-pointer gap-1.5 rounded-lg py-1 pr-1 pl-2'
									onClick={() => onSort('')}>
									<span>{getCurrentSortLabel()}</span>
									<button
										onClick={() => onSort('')}
										className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
										<Icons.x className='h-3 w-3' />
									</button>
								</Badge>
							)}

							{currentStatus && (
								<Badge
									variant='secondary'
									onClick={() => onStatusChange('')}
									className={`cursor-pointer gap-1.5 rounded-lg py-1 pr-1 pl-2 ${
										currentStatus === 'active' ? 'text-green-500' : currentStatus === 'inactive' ? 'text-red-500' : ''
									}`}>
									<div
										className={`h-2 w-2 rounded-full ${
											currentStatus === 'active' ? 'bg-green-500' : currentStatus === 'inactive' ? 'bg-red-500' : ''
										}`}
									/>
									<span>{getCurrentStatusLabel()}</span>
									<button
										onClick={() => onStatusChange('')}
										className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
										<Icons.x className='h-3 w-3' />
									</button>
								</Badge>
							)}

							{activeDateFilters.map(([filterType, range]) => (
								<Badge
									key={filterType}
									variant='secondary'
									className='cursor-pointer gap-1.5 rounded-lg py-1 pr-1 pl-2'
									onClick={() => onClearDateFilter(filterType as DateFilterType)}>
									<Calendar className='h-3 w-3' />
									<span className='max-w-[140px] truncate'>
										{DATE_FILTER_LABELS[filterType as DateFilterType]}: {formatDateRange(range!)}
									</span>
									<button
										onClick={() => onClearDateFilter(filterType as DateFilterType)}
										className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
										<Icons.x className='h-3 w-3' />
									</button>
								</Badge>
							))}
						</div>

						<ActionButton
							icon={<Icons.clearAll />}
							variant='ghost'
							text='Limpiar filtros'
							size='sm'
							onClick={onResetAll}
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
