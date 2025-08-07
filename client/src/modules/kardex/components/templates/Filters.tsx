'use client'

import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { Sparkles, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/layout/atoms/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { SORT_OPTIONS } from '@/modules/kardex/constants/filters.constants'
import { ViewSelector, ViewType } from '@/modules/kardex/components/molecules/ViewSelector'

interface KardexFiltersProps {
	searchValue: string
	isRefreshing: boolean
	currentSort?: string
	currentMovementType?:
		| 'purchase'
		| 'return_in'
		| 'transfer_in'
		| 'sale'
		| 'return_out'
		| 'transfer_out'
		| 'adjustment_in'
		| 'adjustment_out'
		| 'damaged'
		| 'expired'
		| ''
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onSort: (sortKey: string) => void
	onMovementTypeChange: (
		status:
			| 'purchase'
			| 'return_in'
			| 'transfer_in'
			| 'sale'
			| 'return_out'
			| 'transfer_out'
			| 'adjustment_in'
			| 'adjustment_out'
			| 'damaged'
			| 'expired'
			| ''
	) => void
	onRefresh: () => void
	onResetAll: () => void
	viewType: ViewType
	onViewChange: (type: ViewType) => void
}

export function KardexFilters({
	searchValue,
	isRefreshing,
	currentSort,
	currentMovementType,
	onSearchChange,
	onSort,
	onMovementTypeChange,
	onRefresh,
	onResetAll,
	viewType,
	onViewChange,
}: KardexFiltersProps) {
	const [isMounted, setIsMounted] = useState(false)
	const [isSearchFocused, setIsSearchFocused] = useState(false)
	const activeFiltersCount = [searchValue.length > 0, currentMovementType !== '', currentSort !== ''].filter(
		Boolean
	).length

	useEffect(() => setIsMounted(true), [])

	const clearSearch = () => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)

	const getCurrentSortLabel = () => {
		if (!currentSort) return 'Ordenar'
		const sortOption = SORT_OPTIONS.find(option => option.key === currentSort)
		return sortOption?.label || 'Ordenar'
	}

	const getCurrentMovementTypeLabel = () => {
		if (!currentMovementType) return 'Filtro'

		const statusLabels = {
			purchase: 'Compra',
			return_in: 'Devolución de cliente',
			transfer_in: 'Transferencia entrante',
			sale: 'Venta',
			return_out: 'Devolución a proveedor',
			transfer_out: 'Transferencia saliente',
			adjustment_in: 'Ajuste positivo',
			adjustment_out: 'Ajuste negativo',
			damaged: 'Dañado',
			expired: 'Vencido',
		}

		return statusLabels[currentMovementType] || 'Filtro'
	}

	// Mapeo actualizado para coincidir con las variantes del Badge
	const statusConfig: Record<
		Exclude<KardexFiltersProps['currentMovementType'], undefined>,
		{ label: string; variant: Parameters<typeof Badge>[0]['variant']; dotColor: string }
	> = {
		purchase: {
			label: 'Compra',
			variant: 'success',
			dotColor: 'bg-green-600 dark:bg-green-400',
		},
		return_in: {
			label: 'Devolución de cliente',
			variant: 'cyan',
			dotColor: 'bg-cyan-600 dark:bg-cyan-400',
		},
		transfer_in: {
			label: 'Transferencia entrante',
			variant: 'teal',
			dotColor: 'bg-teal-600 dark:bg-teal-400',
		},
		sale: {
			label: 'Venta',
			variant: 'purple',
			dotColor: 'bg-purple-600 dark:bg-purple-400',
		},
		return_out: {
			label: 'Devolución a proveedor',
			variant: 'indigo',
			dotColor: 'bg-indigo-600 dark:bg-indigo-400',
		},
		transfer_out: {
			label: 'Transferencia saliente',
			variant: 'orange',
			dotColor: 'bg-orange-600 dark:bg-orange-400',
		},
		adjustment_in: {
			label: 'Ajuste positivo',
			variant: 'info',
			dotColor: 'bg-blue-600 dark:bg-blue-400',
		},
		adjustment_out: {
			label: 'Ajuste negativo',
			variant: 'warning',
			dotColor: 'bg-yellow-600 dark:bg-yellow-400',
		},
		damaged: {
			label: 'Dañado',
			variant: 'error',
			dotColor: 'bg-red-600 dark:bg-red-400',
		},
		expired: {
			label: 'Vencido',
			variant: 'destructive',
			dotColor: 'bg-destructive',
		},
	}

	if (!isMounted) return null

	return (
		<div className='space-y-4'>
			{/* Main Filters Container */}
			<div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<div className='flex items-center gap-4'>
					{/* Controls */}
					<motion.div
						className='flex items-center gap-2'
						initial={{ opacity: 0, x: 15 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0 }}>
						{/* Sort */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ActionButton icon={<Icons.sortAscending />} text={getCurrentSortLabel()} variant='outline' />
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align='end'
								className='border-border/50 bg-card/90 w-auto rounded-xl shadow-xl backdrop-blur-xl'>
								<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
									<Sparkles className='h-3 w-3' /> Ordenar por
								</DropdownMenuLabel>

								<DropdownMenuSeparator />

								{SORT_OPTIONS.map((option, i) => (
									<DropdownMenuItem
										key={option.key}
										onClick={() => onSort(option.key)}
										className='hover:bg-accent/80 cursor-pointer rounded-lg transition-all duration-200'>
										<motion.div
											className='flex w-full items-center justify-between'
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: i * 0.05 }}>
											<span className={currentSort === option.key ? 'text-primary font-medium' : ''}>
												{option.label}
											</span>
											{currentSort === option.key && (
												<motion.div
													className='bg-primary h-2 w-2 rounded-full'
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{ type: 'spring', stiffness: 500 }}
												/>
											)}
										</motion.div>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Filtro por estado */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ActionButton icon={<Icons.filter />} text={getCurrentMovementTypeLabel()} variant='outline' />
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align='end'
								className='border-border/50 bg-card/90 w-auto rounded-xl shadow-xl backdrop-blur-xl'>
								<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
									<Zap className='h-3 w-3' />
									Estado
								</DropdownMenuLabel>
								<DropdownMenuSeparator />

								{/* Opción "Todos" */}
								<DropdownMenuItem
									onClick={() => onMovementTypeChange('')}
									className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
									<div className='flex w-full items-center justify-between'>
										<div className='flex items-center gap-2'>
											<div className='bg-accent-foreground/40 h-2 w-2 rounded-full' />
											<span className={currentMovementType === '' ? 'text-primary font-medium' : ''}>Todos</span>
										</div>
										{currentMovementType === '' && (
											<motion.div
												className='bg-primary h-2 w-2 rounded-full'
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ type: 'spring', stiffness: 500 }}
											/>
										)}
									</div>
								</DropdownMenuItem>

								{/* Opciones de estado usando la configuración */}
								{Object.entries(statusConfig).map(([key, config], index) => (
									<DropdownMenuItem
										key={key}
										onClick={() => onMovementTypeChange(key as any)}
										className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
										<motion.div
											className='flex w-full items-center justify-between'
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: (index + 1) * 0.05 }}>
											<div className='flex items-center gap-2'>
												<motion.div
													className={`h-2 w-2 rounded-full ${config.dotColor}`}
													whileHover={{ scale: 1.3 }}
													transition={{ type: 'spring', stiffness: 400 }}
												/>
												<span className={currentMovementType === key ? 'text-primary font-medium' : ''}>
													{config.label}
												</span>
											</div>
											{currentMovementType === key && (
												<motion.div
													className='bg-primary h-2 w-2 rounded-full'
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{ type: 'spring', stiffness: 500 }}
												/>
											)}
										</motion.div>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</motion.div>
				</div>

				<motion.div
					className='flex items-center gap-2'
					initial={{ opacity: 0, x: 15 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0 }}>
					<ActionButton
						icon={isRefreshing ? <Icons.refresh className='animate-spin' /> : <Icons.refresh />}
						onClick={onRefresh}
						disabled={isRefreshing}
						text={isRefreshing ? 'Refrescando...' : 'Refrescar'}
						variant='outline'
					/>

					<ActionButton icon={<Icons.download />} variant='outline' text='Reporte' />
				</motion.div>
			</div>

			{/* Active Filters */}
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
										text={
											<div className='flex items-center gap-1.5'>
												<Icons.search className='h-3 w-3' />
												<span className='max-w-[120px] truncate'>{searchValue}</span>
												<button
													onClick={clearSearch}
													className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
													<Icons.x className='h-3 w-3' />
												</button>
											</div>
										}
									/>
								)}

								{currentSort && (
									<Badge
										variant='secondary'
										text={
											<div className='flex items-center gap-1.5'>
												<span>{getCurrentSortLabel()}</span>
												<button
													onClick={() => onSort('')}
													className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
													<Icons.x className='h-3 w-3' />
												</button>
											</div>
										}
									/>
								)}

								{currentMovementType && statusConfig[currentMovementType] && (
									<Badge
										variant={statusConfig[currentMovementType].variant}
										decord={true}
										text={
											<div className='flex items-center gap-1.5'>
												<span>{statusConfig[currentMovementType].label}</span>
												<button
													onClick={() => onMovementTypeChange('')}
													className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
													<Icons.x className='h-3 w-3' />
												</button>
											</div>
										}
									/>
								)}
							</div>

							<ActionButton
								icon={<Icons.clearAll />}
								variant='destructive'
								tooltip='Limpiar filtros'
								onClick={onResetAll}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
