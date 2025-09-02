'use client'

import { toast } from 'sonner'
import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Calendar } from '@/components/ui/calendar'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'
import { Typography } from '@/components/ui/typography'
import {
	startOfWeek,
	endOfWeek,
	subDays,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
	startOfDay,
	endOfDay,
	format,
	isValid,
	parse,
} from 'date-fns'
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

export type ExportFormat = 'pdf' | 'xlsx'

interface ColumnOption {
	id: string
	label: string
	selected: boolean
	type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage'
	group?: string
}

interface ColumnGroup {
	name: string
	label: string
	icon?: React.ReactNode
	columns: ColumnOption[]
	isOpen: boolean
}

const exportOptions = [
	{
		format: 'xlsx' as const,
		label: 'Excel',
		icon: <Icons.fileTypeXls className='h-7 w-7 text-green-600' />,
		description: 'Análisis de datos y edición',
		recommended: true,
	},
	{
		format: 'pdf' as const,
		label: 'PDF',
		icon: <Icons.fileTypePdf className='text-destructive h-7 w-7' />,
		description: 'Compartir y presentar',
	},
]

// Configuración de grupos predeterminados
const defaultGroupConfig: Record<string, { label: string; icon: React.ReactNode }> = {
	basic: {
		label: 'Información Básica',
		icon: <Icons.user className='h-4 w-4' />,
	},
	product: {
		label: 'Información del Producto',
		icon: <Icons.package className='h-4 w-4' />,
	},
	movement: {
		label: 'Movimiento',
		icon: <Icons.chevronDown className='h-4 w-4' />,
	},
	financial: {
		label: 'Financiero',
		icon: <Icons.userDollar className='h-4 w-4' />,
	},
	stock: {
		label: 'Control de Stock',
		icon: <Icons.package className='h-4 w-4' />,
	},
	user: {
		label: 'Usuario',
		icon: <Icons.user className='h-4 w-4' />,
	},
	dates: {
		label: 'Fechas',
		icon: <Icons.calendar className='h-4 w-4' />,
	},
	status: {
		label: 'Estados',
		icon: <Icons.server className='h-4 w-4' />,
	},
	media: {
		label: 'Archivos',
		icon: <Icons.media className='h-4 w-4' />,
	},
	contact: {
		label: 'Contacto',
		icon: <Icons.mail className='h-4 w-4' />,
	},
}

interface ExportReportProps {
	title?: string
	onExport: (format: ExportFormat, selectedColumns?: string[]) => Promise<void> | void
	onSheetOpen?: () => Promise<void>
	data?: any[]
	disabled?: boolean
	size?: 'sm' | 'lg'
	variant?: 'default' | 'ghost' | 'secondary'
	className?: string

	columnLabels?: Record<string, string>
	columnTypes?: Record<string, ColumnOption['type']>
	excludeColumns?: string[]

	columnGroups?: Record<string, string[]>
	customGroupConfig?: Record<string, { label: string; icon?: React.ReactNode }>

	dateFiltersEnabled?: boolean
	dateFilters?: DateFilters
	onDateFilterChange?: (filterType: DateFilterType, range: DateRange) => void
	onClearDateFilter?: (filterType: DateFilterType) => void
	onClearAllDateFilters?: () => void
	hasActiveFilters?: boolean
	originalDataCount?: number
	filteredDataCount?: number
}

// Función para detectar grupo automáticamente
const detectColumnGroup = (key: string, type?: string): string => {
	const lowerKey = key.toLowerCase()

	// Producto
	if (lowerKey.includes('product.') || lowerKey.includes('producto')) return 'product'

	// Movimiento
	if (lowerKey.includes('movement') || lowerKey.includes('quantity') || lowerKey.includes('reason')) return 'movement'

	// Stock
	if (lowerKey.includes('stock') || lowerKey.includes('before') || lowerKey.includes('after')) return 'stock'

	// Usuario
	if (lowerKey.includes('user.') || lowerKey.includes('usuario')) return 'user'

	// Fechas
	if (type === 'date' || lowerKey.includes('date') || lowerKey.includes('at') || lowerKey.includes('time'))
		return 'dates'

	// Estados y booleanos
	if (
		type === 'boolean' ||
		lowerKey.includes('status') ||
		lowerKey.includes('active') ||
		lowerKey.includes('enabled')
	) {
		return 'status'
	}

	// Medios
	if (
		lowerKey.includes('photo') ||
		lowerKey.includes('image') ||
		lowerKey.includes('avatar') ||
		lowerKey.includes('file')
	) {
		return 'media'
	}

	// Contacto
	if (lowerKey.includes('email') || lowerKey.includes('phone') || lowerKey.includes('address')) return 'contact'

	// Financiero
	if (
		type === 'currency' ||
		type === 'percentage' ||
		(type === 'number' &&
			(lowerKey.includes('price') ||
				lowerKey.includes('cost') ||
				lowerKey.includes('total') ||
				lowerKey.includes('tax') ||
				lowerKey.includes('subtotal')))
	) {
		return 'financial'
	}

	// Por defecto: básico
	return 'basic'
}

// Función para obtener el tipo de badge según el tipo de columna
const getColumnTypeBadge = (type: ColumnOption['type']) => {
	switch (type) {
		case 'currency':
			return { variant: 'success', text: 'Moneda' }
		case 'percentage':
			return { variant: 'warning', text: '%' }
		case 'date':
			return { variant: 'info', text: 'Fecha' }
		case 'number':
			return { variant: 'secondary', text: 'Número' }
		case 'boolean':
			return { variant: 'default', text: 'Bool' }
		default:
			return { variant: 'outline', text: 'Texto' }
	}
}

export function ExportReport({
	title = 'Exportar',
	onExport,
	onSheetOpen,
	data = [],
	disabled = false,
	size = 'lg',
	variant = 'default',
	className = '',
	columnLabels = {},
	columnTypes = {},
	excludeColumns = ['__typename', 'deletedAt'],
	columnGroups,
	customGroupConfig = {},
	// Nuevas props para filtros de fecha
	dateFiltersEnabled = false,
	dateFilters = {},
	onDateFilterChange,
	onClearAllDateFilters,
	hasActiveFilters = false,
	originalDataCount = 0,
	filteredDataCount = 0,
}: ExportReportProps) {
	const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx')
	const [groups, setGroups] = useState<Record<string, ColumnGroup>>({})

	// Estados para filtros de fecha
	const [selectedRange, setSelectedRange] = useState<string | null>('')
	const [calendarDate, setCalendarDate] = useState<ReactDayPickerDateRange>({ from: undefined, to: undefined })

	// Estados para fechas personalizadas
	const [customStartDate, setCustomStartDate] = useState<string>('')
	const [customEndDate, setCustomEndDate] = useState<string>('')
	const [customPopoverOpen, setCustomPopoverOpen] = useState(false)

	// Combinar configuración de grupos
	const groupConfig = { ...defaultGroupConfig, ...customGroupConfig }

	const today = new Date()

	const dateRanges = [
		{ label: 'Hoy', start: today, end: today },
		{ label: 'Ayer', start: subDays(today, 1), end: subDays(today, 1) },
		{
			label: 'Esta Semana',
			start: startOfWeek(today, { weekStartsOn: 1 }),
			end: endOfWeek(today, { weekStartsOn: 1 }),
		},
		{
			label: 'Semana Pasada',
			start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
			end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
		},
		{ label: 'Últimos 7 Días', start: subDays(today, 6), end: today },
		{
			label: 'Este Mes',
			start: startOfMonth(today),
			end: endOfMonth(today),
		},
		{
			label: 'Mes Pasado',
			start: startOfMonth(subDays(today, today.getDate())),
			end: endOfMonth(subDays(today, today.getDate())),
		},
		{ label: 'Este Año', start: startOfYear(today), end: endOfYear(today) },
		{
			label: 'Año Pasado',
			start: startOfYear(subDays(today, 365)),
			end: endOfYear(subDays(today, 365)),
		},
	]

	useEffect(() => {
		if (data && data.length > 0) {
			const firstItem = data[0]
			const allColumns = Object.keys(firstItem)
				.filter(key => !excludeColumns.includes(key))
				.map(key => ({
					id: key,
					selected: true,
					label: columnLabels[key] || formatColumnLabel(key),
					type: columnTypes[key] || getColumnType(key, firstItem[key]),
					group: getColumnGroup(key, columnTypes[key]),
				}))

			// Agrupar columnas
			const groupedColumns: Record<string, ColumnGroup> = {}

			allColumns.forEach(column => {
				const groupName = column.group!
				if (!groupedColumns[groupName]) {
					groupedColumns[groupName] = {
						name: groupName,
						label: groupConfig[groupName]?.label || formatColumnLabel(groupName),
						icon: groupConfig[groupName]?.icon,
						columns: [],
						isOpen: groupName === 'basic' || groupName === 'product' || groupName === 'financial',
					}
				}
				groupedColumns[groupName].columns.push(column)
			})

			setGroups(groupedColumns)
		}
	}, [data, columnLabels, columnTypes, excludeColumns])

	// Actualizar calendar date cuando cambien los filtros
	useEffect(() => {
		const firstActiveFilter = Object.values(dateFilters).find(range => range && (range.startDate || range.endDate))

		if (firstActiveFilter) {
			setCalendarDate({
				from: firstActiveFilter.startDate ? new Date(firstActiveFilter.startDate) : undefined,
				to: firstActiveFilter.endDate ? new Date(firstActiveFilter.endDate) : undefined,
			})

			// Actualizar inputs custom
			if (firstActiveFilter.startDate) {
				setCustomStartDate(format(new Date(firstActiveFilter.startDate), 'yyyy-MM-dd'))
			}
			if (firstActiveFilter.endDate) {
				setCustomEndDate(format(new Date(firstActiveFilter.endDate), 'yyyy-MM-dd'))
			}
		} else {
			setCalendarDate({ from: undefined, to: undefined })
			setCustomStartDate('')
			setCustomEndDate('')
		}
	}, [dateFilters])

	const getColumnGroup = (key: string, type?: string): string => {
		if (columnGroups) {
			for (const [groupName, columns] of Object.entries(columnGroups)) {
				if (columns.includes(key)) return groupName
			}
		}
		return detectColumnGroup(key, type)
	}

	const formatColumnLabel = (key: string): string => {
		const withSpaces = key.replace(/([A-Z])/g, ' $1')
		return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim()
	}

	const getColumnType = (key: string, value: any): ColumnOption['type'] => {
		if (columnTypes[key]) return columnTypes[key]

		if (key.includes('At') || key.includes('date') || key.includes('Date')) return 'date'
		if (typeof value === 'number') {
			// Detectar si es porcentaje
			if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent')) return 'percentage'
			// Detectar si es moneda
			if (
				key.toLowerCase().includes('cost') ||
				key.toLowerCase().includes('price') ||
				key.toLowerCase().includes('total') ||
				key.toLowerCase().includes('amount')
			)
				return 'currency'
			return 'number'
		}
		if (typeof value === 'boolean') return 'boolean'

		return 'text'
	}

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
	}

	const selectDateRange = (from: Date, to: Date, range: string) => {
		const startDate = startOfDay(from)
		const endDate = endOfDay(to)

		const dateRange: DateRange = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
		}

		onDateFilterChange?.('createdAt', dateRange)
		setSelectedRange(range)
		setCalendarDate({ from: startDate, to: endDate })
		setCustomPopoverOpen(false)
	}

	const handleDateSelect = (range: ReactDayPickerDateRange | undefined) => {
		if (range && range.from) {
			const from = startOfDay(range.from)
			const to = range.to ? endOfDay(range.to) : from

			const dateRange: DateRange = {
				startDate: from.toISOString(),
				endDate: to.toISOString(),
			}

			onDateFilterChange?.('createdAt', dateRange)
			setCalendarDate({ from, to })
			setSelectedRange(null)
		}
	}

	const handleCustomDateSubmit = () => {
		const startDate = parse(customStartDate, 'yyyy-MM-dd', new Date())
		const endDate = parse(customEndDate, 'yyyy-MM-dd', new Date())

		if (isValid(startDate) && isValid(endDate)) {
			selectDateRange(startDate, endDate, 'Rango Personalizado')
		}
	}

	// Función mejorada para limpiar filtros
	const handleClearAllFilters = () => {
		// Limpiar todos los filtros
		onClearAllDateFilters?.()

		// Limpiar estados locales
		setCalendarDate({ from: undefined, to: undefined })
		setSelectedRange(null)
		setCustomStartDate('')
		setCustomEndDate('')
		setCustomPopoverOpen(false)
	}

	// Manejar apertura del sheet
	const handleSheetOpen = async (open: boolean) => {
		setIsSheetOpen(open)
		if (open && onSheetOpen) await onSheetOpen()
	}

	const handleConfirmExport = async () => {
		if (!selectedFormat) return

		const allColumns = Object.values(groups).flatMap(group => group.columns)
		const selectedColumns = allColumns.filter(col => col.selected).map(col => col.id)

		if (selectedColumns.length === 0) {
			toast.error('Seleccione al menos una columna', {
				description: 'Debe seleccionar al menos una columna para exportar.',
			})
			return
		}

		setIsSheetOpen(false)

		setIsExporting(selectedFormat)

		try {
			await onExport(selectedFormat, selectedColumns)
			toast.success('¡Exportación completada!', {
				description: `Su archivo ${selectedFormat.toUpperCase()} se ha descargado correctamente.`,
			})
		} catch (error) {
			console.error(`Error exporting ${selectedFormat}:`, error)
			toast.error('Error en la exportación', {
				description: `Ocurrió un problema al generar el archivo ${selectedFormat.toUpperCase()}.`,
			})
		} finally {
			setIsExporting(null)
		}
	}

	const toggleGroupExpansion = (groupName: string) => {
		setGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				isOpen: !prev[groupName].isOpen,
			},
		}))
	}

	const toggleColumnSelection = (groupName: string, columnId: string) => {
		setGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				columns: prev[groupName].columns.map(col => (col.id === columnId ? { ...col, selected: !col.selected } : col)),
			},
		}))
	}

	const toggleGroupSelection = (groupName: string) => {
		const group = groups[groupName]
		const allSelected = group.columns.every(col => col.selected)

		setGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				columns: prev[groupName].columns.map(col => ({ ...col, selected: !allSelected })),
			},
		}))
	}

	const toggleAllColumns = () => {
		const allColumns = Object.values(groups).flatMap(group => group.columns)
		const allSelected = allColumns.every(col => col.selected)

		setGroups(prev => {
			const updated = { ...prev }
			Object.keys(updated).forEach(groupName => {
				updated[groupName] = {
					...updated[groupName],
					columns: updated[groupName].columns.map(col => ({ ...col, selected: !allSelected })),
				}
			})
			return updated
		})
	}

	const allColumns = Object.values(groups).flatMap(group => group.columns)
	const selectedColumns = allColumns.filter(col => col.selected)
	const selectedCount = selectedColumns.length
	const totalCount = allColumns.length

	return (
		<>
			<ActionButton
				size={size}
				variant={variant}
				icon={isExporting ? <Icons.refresh className='h-4 w-4 animate-spin' /> : <Icons.download className='h-4 w-4' />}
				text={
					<div className='flex items-center gap-2'>
						<span>{isExporting ? 'Exportando...' : title}</span>
					</div>
				}
				disabled={disabled || !!isExporting || (hasActiveFilters ? false : originalDataCount === 0)}
				className={cn(className)}
				onClick={() => handleSheetOpen(true)}
			/>

			<Sheet open={isSheetOpen} onOpenChange={handleSheetOpen}>
				<SheetContent className='flex min-w-full flex-col'>
					<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b p-6 supports-[backdrop-filter]:backdrop-blur-sm'>
						<div className='flex items-center justify-between'>
							<SheetTitle>Configurar exportación</SheetTitle>
							<SheetClose>
								<ActionButton
									type='button'
									variant='ghost'
									size='icon'
									onClick={handleClearAllFilters}
									disabled={!!isExporting}
									icon={<Icons.x className='h-4 w-4' />}
								/>
							</SheetClose>
						</div>
						<SheetDescription>
							Personalice su reporte seleccionando el formato, las fechas y las columnas a incluir
						</SheetDescription>

						{/* Información de filtrado */}
						{dateFiltersEnabled && (
							<div className='flex items-center justify-between gap-4 text-sm'>
								<div className='flex items-center gap-2'>
									<span className='text-muted-foreground'>Registros:</span>
									<span>
										{filteredDataCount} de {originalDataCount}
									</span>
									{hasActiveFilters && <Badge variant='secondary' text='Filtrados' className='text-xs' />}
								</div>
							</div>
						)}
					</SheetHeader>

					{/* GRID LAYOUT PRINCIPAL */}
					<div className='flex-1 overflow-y-auto'>
						<div className='grid grid-cols-1 gap-12 p-6 lg:grid-cols-3'>
							{/* COLUMNA IZQUIERDA - Filtros y Formato */}
							<div className='col-span-2 space-y-6'>
								{/* Filtros de Fecha */}
								{dateFiltersEnabled && (
									<Card className='border-none bg-transparent p-0 shadow-none'>
										{/* 
										<CardHeader className='p-0'>
											<CardTitle className='flex items-center gap-2 text-lg'>
												<Icons.calendar className='h-4 w-4' />
												Filtros por fecha
											</CardTitle>
											<CardDescription>Filtre los datos por rango de fechas antes de exportar</CardDescription>
										</CardHeader>
										*/}

										{/* Opciones rápidas de fecha */}
										<div className='grid grid-cols-3 gap-8'>
											<div className='col-span-2 space-y-4'>
												<Calendar
													mode='range'
													defaultMonth={calendarDate.from}
													selected={calendarDate}
													onSelect={handleDateSelect}
													numberOfMonths={2}
													showOutsideDays={false}
													className='col-span-2 rounded-2xl'
												/>

												{hasActiveFilters && (
													<div className='mt-2 flex items-center justify-between'>
														<div className='flex items-center gap-2 text-sm'>
															<span>
																Rango: {''}
																{calendarDate.from &&
																	(calendarDate.to && calendarDate.from !== calendarDate.to ? (
																		<>
																			{formatDate(calendarDate.from)} - {formatDate(calendarDate.to)}
																		</>
																	) : (
																		formatDate(calendarDate.from)
																	))}
															</span>
														</div>

														<ActionButton
															onClick={handleClearAllFilters}
															variant='ghost'
															size='sm'
															text='Limpiar'
															className='text-destructive'
														/>
													</div>
												)}
											</div>

											<div className='flex flex-col gap-2'>
												{dateRanges.slice(0, 8).map(({ label, start, end }) => (
													<Button
														key={label}
														variant='ghost'
														size='sm'
														className={cn(
															'hover:bg-accent hover:text-accent-foreground flex justify-start text-sm',
															selectedRange === label && 'bg-primary text-primary-foreground hover:bg-primary/90'
														)}
														onClick={() => selectDateRange(start, end, label)}>
														{label}
													</Button>
												))}

												{/* Separador */}
												<div className='my-2 border-t'></div>

												{/* Botón para fechas custom con Popover */}
												<Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
													<PopoverTrigger asChild>
														<Button
															variant='ghost'
															size='sm'
															className={cn(
																'hover:bg-accent hover:text-accent-foreground justify-start',
																(customPopoverOpen || selectedRange === 'Rango Personalizado') &&
																	'bg-primary text-primary-foreground hover:bg-primary/90'
															)}>
															<Icons.sparkles className='mr-2 h-4 w-4' />
															Personalizada
														</Button>
													</PopoverTrigger>
													<PopoverContent className='w-80 rounded-2xl p-6' align='end' side='right'>
														<div className='space-y-4'>
															<div className='space-y-2'>
																<h4 className='text-sm font-semibold'>Seleccionar Rango Personalizado</h4>
																<p className='text-muted-foreground text-xs'>
																	Elije las fechas de inicio y fin para tu filtro personalizado.
																</p>
															</div>
															<div className='space-y-4'>
																<div className='space-y-2'>
																	<Label htmlFor='start-date' className='text-sm font-medium'>
																		Fecha de Inicio
																	</Label>
																	<Input
																		id='start-date'
																		type='date'
																		value={customStartDate}
																		onChange={e => setCustomStartDate(e.target.value)}
																		className='w-full'
																	/>
																</div>
																<div className='space-y-2'>
																	<Label htmlFor='end-date' className='text-sm font-medium'>
																		Fecha de Fin
																	</Label>
																	<Input
																		id='end-date'
																		type='date'
																		value={customEndDate}
																		onChange={e => setCustomEndDate(e.target.value)}
																		className='w-full'
																	/>
																</div>
															</div>
															<div className='flex gap-2 pt-2'>
																<Button
																	size='sm'
																	onClick={handleCustomDateSubmit}
																	disabled={!customStartDate || !customEndDate}
																	className='flex-1'>
																	Aplicar
																</Button>
															</div>
														</div>
													</PopoverContent>
												</Popover>
											</div>
										</div>
									</Card>
								)}
							</div>

							{/* COLUMNA DERECHA - Columnas */}
							<div className='space-y-12'>
								{/* Formato */}
								<Card className='border-none bg-transparent p-0 shadow-none'>
									<CardHeader className='p-0'>
										<CardTitle className='flex items-center gap-2 text-lg'>
											<Icons.file className='h-4 w-4' />
											Formato de archivo
										</CardTitle>
										<CardDescription>Selecciona el formato en el que deseas exportar los datos</CardDescription>
									</CardHeader>

									<div className='grid grid-cols-2 gap-6'>
										{exportOptions.map(option => (
											<Card
												key={option.format}
												className={`cursor-pointer py-4 shadow-none transition-all duration-500 ease-in-out ${
													selectedFormat === option.format
														? 'border-primary bg-accent/30'
														: 'border-border hover:bg-muted/50'
												} flex items-center gap-4 rounded-2xl`}
												onClick={() => setSelectedFormat(option.format)}>
												<div className='flex items-center gap-4'>
													<div
														className={`rounded-lg p-3 ${
															selectedFormat === option.format
																? 'bg-muted text-primary'
																: 'bg-muted text-muted-foreground'
														}`}>
														{option.icon}
													</div>
													<span className='text-center text-base font-medium uppercase'>{option.format}</span>
												</div>
											</Card>
										))}
									</div>
								</Card>

								{/* Columnas */}
								<Card className='border-none bg-transparent p-0 shadow-none'>
									<CardHeader className='p-0'>
										<CardTitle className='flex items-center gap-2 text-lg'>
											<Icons.list className='h-4 w-4' />
											Columnas a exportar
										</CardTitle>
										<CardDescription>Elige qué columnas incluir en el archivo de exportación</CardDescription>
									</CardHeader>

									<div className='flex items-center justify-between gap-4'>
										<p className='flex items-center gap-2 font-semibold'>
											Seleccionadas
											<Badge variant='default' text={`${selectedCount}/${totalCount}`} />
										</p>
										<Button variant='ghost' size='sm' onClick={toggleAllColumns}>
											{allColumns.every(col => col.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
										</Button>
									</div>

									<div className='space-y-4'>
										{Object.values(groups).map(group => (
											<Collapsible
												key={group.name}
												open={group.isOpen}
												onOpenChange={() => toggleGroupExpansion(group.name)}>
												<Card className='dark:bg-card bg-accent/50 border-none p-4 shadow-none'>
													<CollapsibleTrigger className='flex w-full cursor-pointer items-center justify-between text-left'>
														<div className='flex items-center gap-3'>
															{group.icon}
															<span className='font-medium'>{group.label}</span>
															<Badge
																variant='secondary'
																text={`${group.columns.filter(col => col.selected).length}/${group.columns.length}`}
															/>
														</div>
														<div className='flex items-center gap-2'>
															<Button
																variant='ghost'
																size='sm'
																onClick={e => {
																	e.stopPropagation()
																	toggleGroupSelection(group.name)
																}}>
																{group.columns.every(col => col.selected) ? 'Deseleccionar' : 'Seleccionar'}
															</Button>
															{group.isOpen ? (
																<ChevronDown className='h-4 w-4' />
															) : (
																<ChevronRight className='h-4 w-4' />
															)}
														</div>
													</CollapsibleTrigger>

													<CollapsibleContent className='mt-3 space-y-2'>
														{group.columns.map(column => {
															const badgeConfig = getColumnTypeBadge(column.type)
															return (
																<div
																	key={column.id}
																	className='hover:bg-accent/50 flex items-center space-x-3 rounded-lg px-2 py-1'>
																	<Checkbox
																		id={`${group.name}-${column.id}`}
																		checked={column.selected}
																		onCheckedChange={() => toggleColumnSelection(group.name, column.id)}
																	/>
																	<Label
																		htmlFor={`${group.name}-${column.id}`}
																		className='flex-1 cursor-pointer text-sm'>
																		{column.label}
																	</Label>
																	<Badge variant={badgeConfig.variant} text={badgeConfig.text} />
																</div>
															)
														})}
													</CollapsibleContent>
												</Card>
											</Collapsible>
										))}
									</div>
								</Card>
							</div>
						</div>
					</div>

					<SheetFooter className='border-t pt-4'>
						<div className='flex items-center justify-between'>
							<div>
								{filteredDataCount === 0 && (
									<Typography
										variant='small'
										className='flex items-center gap-2 text-sm text-amber-600 dark:text-amber-600'>
										<Icons.infoCircle className='h-5 w-5' />
										No encontramos registros en las fechas seleccionadas.
									</Typography>
								)}
							</div>

							<div className='flex justify-end gap-3'>
								<ActionButton
									type='button'
									variant='ghost'
									onClick={() => setIsSheetOpen(false)}
									disabled={!!isExporting}
									text='Cancelar'
									icon={<Icons.x className='h-4 w-4' />}
								/>

								<Button
									onClick={handleConfirmExport}
									disabled={!!isExporting || selectedColumns.length === 0 || filteredDataCount === 0}
									className='min-w-32'>
									{isExporting ? (
										<>
											<Icons.refresh className='h-4 w-4 animate-spin' />
											Exportando...
										</>
									) : (
										<>
											<Icons.download className='h-4 w-4' />
											Exportar
										</>
									)}
								</Button>
							</div>
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	)
}
