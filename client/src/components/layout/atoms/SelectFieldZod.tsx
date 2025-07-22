'use client'

import React from 'react'
import { FieldError } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
	id?: string
	label: string
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	error?: FieldError
	options: Array<{ value: string; label: string }>
	required?: boolean
	className?: string
}

export const SelectFieldZod: React.FC<Props> = ({
	id,
	label,
	placeholder = 'Selecciona...',
	value,
	onChange,
	error,
	options,
	required = true,
	className = '',
}) => (
	<div className={`flex w-full flex-col gap-y-1.5 ${className}`}>
		<div className='flex gap-x-1'>
			<Label htmlFor={id} className={`${error ? 'text-destructive' : ''}`}>
				{label}
			</Label>
			{required && <span className='text-destructive'>*</span>}
		</div>
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger id={id} className={`${error ? 'border-destructive dark:border-destructive' : ''}`}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map(option => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
		{error && (
			<Typography variant='span' className='text-destructive'>
				{error.message}
			</Typography>
		)}
	</div>
)
