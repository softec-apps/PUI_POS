'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'

interface Option {
	value: string
	label: string
}

interface MultiSelectFieldProps {
	id: string
	label?: string
	placeholder?: string
	options: Option[]
	value: string[]
	onChange: (value: string[]) => void
	className?: string
	isLoading?: boolean
	disabled?: boolean
}

export function MultiSelectField({
	id,
	label,
	placeholder = 'Selecciona opciones...',
	options,
	value = [],
	onChange,
	className,
	isLoading = false,
	disabled = false,
}: MultiSelectFieldProps) {
	const [open, setOpen] = useState(false)

	const handleSelect = (optionValue: string) => {
		const newValue = value.includes(optionValue) ? value.filter(v => v !== optionValue) : [...value, optionValue]
		onChange(newValue)
	}

	const selectedLabels = options
		.filter(option => value.includes(option.value))
		.map(option => option.label)
		.join(', ')

	return (
		<div className={cn('space-y-2', className)}>
			{label && <Label htmlFor={id}>{label}</Label>}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between'
						disabled={disabled || isLoading}>
						{isLoading ? (
							<div className='flex items-center'>
								<Icons.spinnerSimple className='mr-2 h-4 w-4 animate-spin' />
								Cargando opciones...
							</div>
						) : value.length > 0 ? (
							<span className='truncate'>{selectedLabels || placeholder}</span>
						) : (
							<span className='text-muted-foreground'>{placeholder}</span>
						)}
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-full p-0'>
					<Command>
						<CommandInput placeholder='Buscar opciones...' />
						<CommandEmpty>No se encontraron opciones</CommandEmpty>
						<CommandGroup className='max-h-full overflow-auto'>
							{options.map(option => (
								<CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
									<Check className={cn('mr-2 h-4 w-4', value.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}
