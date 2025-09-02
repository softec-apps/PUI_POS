'use client'
import React from 'react'
import { DateFilters, DateFilterType, DateRange } from '@/common/types/pagination'
import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Icons } from '@/components/icons'

interface DateFiltersDropdownProps {
	dateFilters: DateFilters
	onDateFilterChange: (filterType: DateFilterType, range: DateRange) => void
	onClearDateFilter: (filterType: DateFilterType) => void
	customRanges?: Array<{
		label: string
		start: Date
		end: Date
	}>
}

export function DateFiltersDropdown({
	dateFilters,
	onDateFilterChange,
	onClearDateFilter,
	customRanges = [],
}: DateFiltersDropdownProps) {
	const [selectedRange, setSelectedRange] = React.useState<string | null>('Este Año')
	const [calendarDate, setCalendarDate] = React.useState<ReactDayPickerDateRange>({ from: undefined, to: undefined })
	const [customStartDate, setCustomStartDate] = React.useState<string>('')
	const [customEndDate, setCustomEndDate] = React.useState<string>('')
	const [showCustomInputs, setShowCustomInputs] = React.useState(false)
	const [customPopoverOpen, setCustomPopoverOpen] = React.useState(false)

	const activeFiltersCount = Object.values(dateFilters).filter(
		range => range && (range.startDate || range.endDate)
	).length

	const hasActiveFilters = activeFiltersCount > 0

	// Convertir el formato de DateRange para mostrar en el calendario
	React.useEffect(() => {
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
			setSelectedRange(null)
		}
	}, [dateFilters])

	const today = new Date()

	const defaultDateRanges = [
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

	// Combinar rangos predeterminados con rangos custom
	const allDateRanges = [...defaultDateRanges, ...customRanges]

	const selectDateRange = (from: Date, to: Date, range: string) => {
		const startDate = startOfDay(from)
		const endDate = endOfDay(to)

		const dateRange: DateRange = {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
		}

		onDateFilterChange('createdAt', dateRange)
		setSelectedRange(range)
		setCalendarDate({ from: startDate, to: endDate })
		setShowCustomInputs(false)
	}

	const handleDateSelect = (range: ReactDayPickerDateRange | undefined) => {
		if (range && range.from) {
			const from = startOfDay(range.from)
			const to = range.to ? endOfDay(range.to) : from

			const dateRange: DateRange = {
				startDate: from.toISOString(),
				endDate: to.toISOString(),
			}

			onDateFilterChange('createdAt', dateRange)
			setCalendarDate({ from, to })
			setSelectedRange(null)
		}
	}

	const handleCustomDateSubmit = () => {
		const startDate = parse(customStartDate, 'yyyy-MM-dd', new Date())
		const endDate = parse(customEndDate, 'yyyy-MM-dd', new Date())

		if (isValid(startDate) && isValid(endDate)) {
			selectDateRange(startDate, endDate, 'Rango Personalizado')
			setCustomPopoverOpen(false)
		}
	}

	const clearFilters = () => {
		onClearDateFilter('createdAt')
		setSelectedRange(null)
		setCalendarDate({ from: undefined, to: undefined })
		setCustomStartDate('')
		setCustomEndDate('')
		setShowCustomInputs(false)
		setCustomPopoverOpen(false)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton icon={<Icons.calendar />} text='Fechas' variant={hasActiveFilters ? 'secondary' : 'ghost'} />
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='min-w-2xl rounded-2xl p-0'>
				<div className='flex items-center justify-between border-b p-4'>
					<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 p-0 text-xs font-medium tracking-wide uppercase'>
						Filtros por Fecha
					</DropdownMenuLabel>
					{hasActiveFilters && (
						<ActionButton
							onClick={clearFilters}
							variant='ghost'
							size='sm'
							text='Limpiar'
							className='text-destructive'
						/>
					)}
				</div>

				{/* Calendario integrado directamente */}
				<div className='flex'>
					{/* Opciones rápidas */}
					<div className='border-border flex min-w-[200px] flex-col gap-1 border-r p-4 pr-4 text-left'>
						{allDateRanges.map(({ label, start, end }) => (
							<Button
								key={label}
								variant='ghost'
								size='sm'
								className={cn(
									'hover:bg-accent hover:text-accent-foreground justify-start',
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

					<CalendarComponent
						mode='range'
						defaultMonth={calendarDate.from}
						selected={calendarDate}
						onSelect={handleDateSelect}
						numberOfMonths={2}
						showOutsideDays={false}
						captionLayout='dropdown'
					/>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
