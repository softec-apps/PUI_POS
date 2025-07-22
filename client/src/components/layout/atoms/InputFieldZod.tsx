'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface Props {
	id?: string
	label: string
	placeholder?: string
	type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
	register: UseFormRegisterReturn
	error?: FieldError
	required?: boolean
	className?: string
}

export const InputFieldZod: React.FC<Props> = ({
	id,
	label,
	placeholder,
	type = 'text',
	register,
	error,
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

		<Input
			id={id}
			{...register}
			type={type}
			placeholder={placeholder}
			className={`${error ? 'border-destructive placeholder:text-destructive dark:border-destructive' : ''}`}
		/>

		{error && (
			<Typography variant='span' className='text-destructive'>
				{error.message}
			</Typography>
		)}
	</div>
)
