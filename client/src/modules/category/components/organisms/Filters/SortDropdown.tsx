'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowUp, ArrowDown } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Button } from '@/components/ui/button'
import { FIELDS, SORT_OPTIONS } from '@/modules/category/constants/category.constants'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

interface SortDropdownProps {
	currentSort?: string
	onSort: (sortKey: string) => void
}

interface SortOption {
	label: string
	field: string
	order: 'asc' | 'desc'
	key: string
}

// Función para obtener opciones de un campo
const getFieldOptions = (field: string, options: SortOption[]) => {
	return {
		asc: options.find(opt => opt.field === field && opt.order === 'asc'),
		desc: options.find(opt => opt.field === field && opt.order === 'desc'),
	}
}

export function SortDropdown({ currentSort, onSort }: SortDropdownProps) {
	const getCurrentSortInfo = () => {
		if (!currentSort || currentSort === '') return null

		const sortOption = SORT_OPTIONS.find(option => option.key === currentSort)
		if (!sortOption) return null

		const field = FIELDS.find(f => f.key === sortOption.field)
		return {
			fieldName: field?.name || sortOption.field,
			order: sortOption.order,
		}
	}

	const sortInfo = getCurrentSortInfo()
	const hasActiveSort = !!sortInfo

	const getButtonText = () => {
		if (!sortInfo) return 'Ordenar'
		const direction = sortInfo.order === 'asc' ? '↑' : '↓'
		return `${sortInfo.fieldName} ${direction}`
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton
					icon={<Icons.sortAscending />}
					text={getButtonText()}
					variant={hasActiveSort ? 'secondary' : 'ghost'}
				/>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='min-w-xs p-0'>
				<div className='flex items-center justify-between p-3'>
					<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 p-0 text-xs tracking-wide uppercase'>
						<Sparkles className='h-3 w-3' /> Ordenar por
					</DropdownMenuLabel>

					{hasActiveSort && (
						<ActionButton
							onClick={() => onSort('')}
							variant='ghost'
							size='sm'
							text='Limpiar'
							className='text-destructive'
						/>
					)}
				</div>

				<DropdownMenuSeparator />

				{/* Grid Layout: Campos vs Direcciones */}
				<div className='p-3'>
					{/* Header */}
					<div className='mb-3 grid grid-cols-3 gap-2'>
						<div className='text-muted-foreground text-xs font-medium'>Campo</div>
						<div className='text-muted-foreground text-center text-xs font-medium'>↑ Asc</div>
						<div className='text-muted-foreground text-center text-xs font-medium'>↓ Desc</div>
					</div>

					{/* Filas de campos */}
					{FIELDS.map((field, index) => {
						const options = getFieldOptions(field.key, SORT_OPTIONS as SortOption[])
						const isFieldActive = sortInfo?.fieldName === field.name

						return (
							<motion.div
								key={field.key}
								className='mb-2 grid grid-cols-3 gap-2'
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}>
								{/* Nombre del campo */}
								<div
									className={cn(
										'flex items-center rounded px-2 py-1 text-sm',
										isFieldActive && 'text-primary font-medium'
									)}>
									{field.name}
								</div>

								{/* Botón Ascendente */}
								<Button
									variant={currentSort === options.asc?.key ? 'default' : 'ghost'}
									size='sm'
									className='h-8 w-full'
									onClick={() => options.asc && onSort(options.asc.key)}>
									<ArrowUp className='h-3 w-3' />
								</Button>

								{/* Botón Descendente */}
								<Button
									variant={currentSort === options.desc?.key ? 'default' : 'ghost'}
									size='sm'
									className='h-8 w-full'
									onClick={() => options.desc && onSort(options.desc.key)}>
									<ArrowDown className='h-3 w-3' />
								</Button>
							</motion.div>
						)
					})}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
