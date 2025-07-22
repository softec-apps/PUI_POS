'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { Textarea } from '@/components/ui/textarea'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface Props {
	id?: string
	label: string
	placeholder?: string
	register: UseFormRegisterReturn
	error?: FieldError
	required?: boolean
	className?: string
	rows?: number
	description?: string
}

export const TextareaFieldZod: React.FC<Props> = ({
	id,
	label,
	placeholder,
	register,
	error,
	required = true,
	className = '',
	rows = 3,
	description,
}) => (
	<div className={`flex w-full flex-col gap-y-1.5 ${className}`}>
		<div className='flex gap-x-1'>
			<Label htmlFor={id} className={`${error ? 'text-destructive' : ''}`}>
				{label}
			</Label>
			{required && <span className='text-destructive'>*</span>}
		</div>

		<Textarea
			id={id}
			{...register}
			placeholder={placeholder}
			rows={rows}
			className={`${error ? 'border-destructive placeholder:text-destructive dark:border-destructive' : ''}`}
		/>

		{description && (
			<Typography variant='muted' className='mt-1'>
				{description}
			</Typography>
		)}

		{error && (
			<Typography variant='span' className='text-destructive'>
				{error.message}
			</Typography>
		)}
	</div>
)
