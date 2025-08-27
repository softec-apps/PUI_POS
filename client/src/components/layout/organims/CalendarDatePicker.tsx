'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
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
} from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface CalendarDatePickerProps {
	id?: string
	className?: string
	date: DateRange
	closeOnSelect?: boolean
	numberOfMonths?: 1 | 2
	onDateSelect: (range: { from: Date; to: Date }) => void
}

export const CalendarDatePicker = React.forwardRef<HTMLButtonElement, CalendarDatePickerProps>(
	(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		{ id = 'calendar-date-picker', className, date, closeOnSelect = false, numberOfMonths = 2, onDateSelect, ...props },
		ref
	) => {
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
		const [selectedRange, setSelectedRange] = React.useState<string | null>(numberOfMonths === 2 ? 'Este Año' : 'Hoy')

		const handleClose = () => setIsPopoverOpen(false)
		const handleTogglePopover = () => setIsPopoverOpen(prev => !prev)

		const selectDateRange = (from: Date, to: Date, range: string) => {
			const startDate = startOfDay(from)
			const endDate = numberOfMonths === 2 ? endOfDay(to) : startDate
			onDateSelect({ from: startDate, to: endDate })
			setSelectedRange(range)
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			closeOnSelect && setIsPopoverOpen(false)
		}

		const handleDateSelect = (range: DateRange | undefined) => {
			if (range) {
				let from = startOfDay(range.from as Date)
				let to = range.to ? endOfDay(range.to) : from

				if (numberOfMonths === 1) {
					if (range.from !== date.from) {
						to = from
					} else {
						from = startOfDay(range.to as Date)
					}
				}

				onDateSelect({ from, to })
			}
			setSelectedRange(null)
		}

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

		const formatDate = (date: Date) => {
			return date.toLocaleDateString('es-ES', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			})
		}

		return (
			<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						id='date'
						ref={ref}
						variant='outline'
						className={cn(
							'w-auto justify-start text-left font-normal',
							!date?.from && 'text-muted-foreground',
							className
						)}
						onClick={handleTogglePopover}
						{...props}>
						<CalendarIcon className='mr-2 h-4 w-4' />
						<span>
							{date?.from ? (
								date.to && numberOfMonths === 2 ? (
									<>
										{formatDate(date.from)} - {formatDate(date.to)}
									</>
								) : (
									formatDate(date.from)
								)
							) : (
								<span>Seleccionar fechas</span>
							)}
						</span>
					</Button>
				</PopoverTrigger>

				{isPopoverOpen && (
					<PopoverContent
						className='w-auto p-0'
						align='center'
						onInteractOutside={handleClose}
						onEscapeKeyDown={handleClose}>
						<div className='flex'>
							{numberOfMonths === 2 && (
								<div className='border-border hidden flex-col gap-1 border-r p-4 pr-4 text-left md:flex'>
									<div className='text-muted-foreground mb-2 text-sm font-medium'>Opciones rápidas</div>
									{dateRanges.map(({ label, start, end }) => (
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
								</div>
							)}

							<Calendar
								mode='range'
								defaultMonth={date.from}
								selected={date}
								onSelect={handleDateSelect}
								numberOfMonths={numberOfMonths}
								showOutsideDays={false}
								captionLayout='dropdown'
							/>
						</div>
					</PopoverContent>
				)}
			</Popover>
		)
	}
)

CalendarDatePicker.displayName = 'CalendarDatePicker'
