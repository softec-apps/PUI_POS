'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import { Switch } from '@/components/ui/switch'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface Props {
	id?: string
	label: string
	register: UseFormRegisterReturn
	error?: FieldError
	required?: boolean
	className?: string
}

export const SwitchFieldZod: React.FC<Props> = ({ id, label, register, error, required = false, className = '' }) => (
	<div className={`flex w-full flex-col gap-y-1.5 ${className}`}>
		<div className='flex items-center gap-x-2'>
			<Switch id={id} {...register} />
			<div className='flex gap-x-1'>
				<Label htmlFor={id} className={`${error ? 'text-destructive' : ''}`}>
					{label}
				</Label>
				{required && <span className='text-destructive'>*</span>}
			</div>
		</div>

		{error && (
			<Typography variant='span' className='text-destructive'>
				{error.message}
			</Typography>
		)}
	</div>
)
