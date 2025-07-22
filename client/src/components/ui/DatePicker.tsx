'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { CalendarIcon, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultRange?: DateRange
	onDateChange?: (range: DateRange | undefined) => void
}

export function DatePickerWithRange({ className, defaultRange, onDateChange }: DatePickerWithRangeProps) {
	const [date, setDate] = React.useState<DateRange | undefined>(
		defaultRange ?? {
			from: undefined,
			to: undefined,
		}
	)

	const handleDateChange = (range: DateRange | undefined) => {
		setDate(range)
		onDateChange?.(range)
	}

	const clearSelection = () => handleDateChange(undefined)

	return (
		<div className={cn('grid gap-2', className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id='date'
						variant={'ghost'}
						size='sm'
						className={cn('group w-full justify-start text-left font-normal', !date?.from && 'text-muted-foreground')}>
						<div className='flex w-full items-center gap-2'>
							<CalendarIcon className='h-4 w-4' />
							{date?.from ? (
								date.to ? (
									<>
										{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
									</>
								) : (
									format(date.from, 'LLL dd, y')
								)
							) : (
								<span>Fecha</span>
							)}
							{date?.from && (
								<>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={e => {
														e.stopPropagation()
														clearSelection()
													}}
													className='hover:bg-muted ml-auto cursor-pointer rounded-full p-0.5 transition-opacity group-hover:opacity-100'>
													<X className='text-muted-foreground hover:text-foreground h-4 w-4' />
												</button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Restablecer fechas</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</>
							)}
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='end'>
					<div className='relative'>
						<Calendar
							initialFocus
							mode='range'
							defaultMonth={date?.from}
							selected={date}
							onSelect={handleDateChange}
							numberOfMonths={2}
						/>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
