'use client'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'
import { Sparkles, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { SORT_OPTIONS } from '@/modules/atribute/constants/filters.constants'
import { SaleStatus } from '@/common/types/modules/sale'

interface Props {
	searchValue: string
	isRefreshing: boolean
	currentSort?: string
	currentStatus?: SaleStatus | ''
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onSort: (sortKey: string) => void
	onStatusChange: (status: SaleStatus | '') => void
	onRefresh: () => void
	onResetAll: () => void
}

export function SalesFilters({
	searchValue,
	isRefreshing,
	currentSort,
	currentStatus,
	onSearchChange,
	onSort,
	onStatusChange,
	onRefresh,
	onResetAll,
}: Props) {
	const [isMounted, setIsMounted] = useState(false)
	const [isSearchFocused, setIsSearchFocused] = useState(false)
	const activeFiltersCount = [searchValue.length > 0, currentStatus !== '', currentSort !== ''].filter(Boolean).length

	useEffect(() => setIsMounted(true), [])

	const getCurrentSortLabel = () => {
		if (!currentSort) return 'Ordenar'
		const sortOption = SORT_OPTIONS.find(option => option.key === currentSort)
		return sortOption?.label || 'Ordenar'
	}

	const getCurrentStatusLabel = () => {
		if (!currentStatus) return 'Filtro'
		if (currentStatus === 'completed') return 'Completado'
		if (currentStatus === 'pending') return 'Pendiente'
		if (currentStatus === 'cancelled') return 'Cancelado'
        return 'Filtro'
	}

	const clearSearch = () => onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)

	if (!isMounted) return null

	return (
		<div className='space-y-4'>
			<div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
				<motion.div
					className='items-center gap-2 space-y-4 sm:flex sm:space-y-0'
					initial={{ opacity: 0, x: -15 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0 }}>
					<div
						className={`relative rounded-xl transition-all duration-300 ${
							isSearchFocused ? 'ring-primary/20 shadow-lg ring-2' : ''
						}`}>
						<div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4'>
							<Icons.search size={18} />
						</div>

						<Input
							placeholder='Buscar registros...'
							className='text-primary bg-background dark:border-border/50 w-full rounded-2xl pr-12 pl-12 shadow-none transition-all duration-500'
							onChange={onSearchChange}
							value={searchValue}
							onFocus={() => setIsSearchFocused(true)}
							onBlur={() => setIsSearchFocused(false)}
							aria-label='Buscar ventas'
						/>

						<AnimatePresence>
							{searchValue && (
								<motion.button
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									onClick={clearSearch}
									className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2 transition-colors'
									aria-label='Limpiar búsqueda'>
									<div className='bg-accent hover:bg-accent-foreground/20 cursor-pointer rounded-full p-1 transition-colors duration-300'>
										<Icons.x className='h-4 w-4' />
									</div>
								</motion.button>
							)}
						</AnimatePresence>
					</div>
				</motion.div>

				<motion.div
					className='flex items-center gap-2'
					initial={{ opacity: 0, x: 15 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0 }}>
					<div className='flex items-center gap-4'>
						<motion.div
							className='flex items-center gap-2'
							initial={{ opacity: 0, x: 15 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0 }}>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<ActionButton icon={<Icons.sortAscending />} text={getCurrentSortLabel()} variant='ghost' />
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align='end'
									className='border-border/50 bg-card/90 w-auto rounded-xl shadow-xl backdrop-blur-xl'
									asChild>
									<motion.div
										initial={{ opacity: 0, y: -10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -10, scale: 0.95 }}
										transition={{ duration: 0.2 }}>
										<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
											<Sparkles className='h-3 w-3' />
											Ordenar por
										</DropdownMenuLabel>

										<DropdownMenuSeparator />

										{SORT_OPTIONS.map((option, index) => (
											<DropdownMenuItem
												key={option.key}
												onClick={() => onSort(option.key)}
												className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
												<motion.div
													className='flex w-full items-center justify-between'
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}>
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
									</motion.div>
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<ActionButton icon={<Icons.filter />} text={getCurrentStatusLabel()} variant='ghost' />
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align='end'
									className='border-border/50 bg-card/90 w-auto rounded-xl shadow-xl backdrop-blur-xl'>
									<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
										<Zap className='h-3 w-3' />
										Estado
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{[
										{ key: '', label: 'Todos', color: 'bg-accent-foreground/40' },
										{ key: 'completed', label: 'Completado', color: 'bg-green-500' },
										{ key: 'pending', label: 'Pendiente', color: 'bg-yellow-500' },
                                        { key: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
									].map((status, index) => (
										<DropdownMenuItem
											key={status.key}
											onClick={() => onStatusChange(status.key as SaleStatus | '')}
											className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
											<motion.div
												className='flex w-full items-center justify-between'
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.05 }}>
												<div className='flex items-center gap-2'>
													<motion.div
														className={`h-2 w-2 rounded-full ${status.color}`}
														whileHover={{ scale: 1.3 }}
														transition={{ type: 'spring', stiffness: 400 }}
													/>
													<span className={currentStatus === status.key ? 'text-primary font-medium' : ''}>
														{status.label}
													</span>
												</div>
												{currentStatus === status.key && (
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

							<ActionButton
								icon={isRefreshing ? <Icons.refresh className='animate-spin' /> : <Icons.refresh />}
								onClick={onRefresh}
								disabled={isRefreshing}
								text={isRefreshing ? 'Refrescando...' : 'Refrescar'}
								variant='secondary'
							/>
						</motion.div>
					</div>
				</motion.div>
			</div>

			<AnimatePresence>
				{activeFiltersCount > 0 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className='overflow-hidden'>
						<div className='flex flex-wrap items-center justify-between'>
							<div className='flex flex-wrap items-center gap-2'>
								<span className='text-muted-foreground flex items-center gap-2 text-sm'>
									<Sparkles className='h-4 w-4' />
									Filtros activos:
								</span>

								{searchValue && (
									<Badge variant='secondary' className='gap-1.5 rounded-lg py-1 pr-1 pl-2' onClick={clearSearch}>
										<Icons.search className='h-3 w-3' />
										<span className='max-w-[120px] truncate'>{searchValue}</span>
										<button
											onClick={clearSearch}
											className='hover:bg-muted-foreground text-muted-foreground hover:text-muted cursor-pointer rounded-full p-0.5 transition-all duration-500'>
											<Icons.x className='h-3 w-3' />
										</button>
									</Badge>
								)}

								{currentStatus && (
									<Badge
										variant='secondary'
										onClick={() => onStatusChange('')}
										className={`pl- 2 gap-1.5 rounded-lg py-1 pr-1`}>
										<span>{getCurrentStatusLabel()}</span>
										<button
											onClick={() => onStatusChange('')}
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
		</div>
	)
}
