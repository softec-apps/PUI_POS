'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { CategoryFormData } from '@/modules/category/types/category-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { STATUS_OPTIONS } from '@/modules/category/constants/category.constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatusSectionProps {
	control: Control<CategoryFormData>
}

export function StatusSection({ control }: StatusSectionProps) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.rosetteDiscountCheck className='h-4 w-4' />
					Estado
				</CardTitle>
				<CardDescription>Selecciona si la categoría debe estar activo o inactivo dentro del sistema.</CardDescription>
			</CardHeader>

			<CardContent className='grid grid-cols-1 items-start gap-4 p-0 md:grid-cols-1'>
				<UniversalFormField
					required
					control={control}
					name='status'
					type='select'
					label='Seleccionar estado'
					placeholder='Selecciona un estado'
					options={STATUS_OPTIONS}
				/>
			</CardContent>
		</Card>
	)
}
