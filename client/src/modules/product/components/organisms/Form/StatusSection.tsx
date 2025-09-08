'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { ProductFormData } from '@/modules/product/types/product-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { STATUS_OPTIONS } from '@/modules/product/constants/product.constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatusSectionProps {
	control: Control<ProductFormData>
	isEditing: boolean
}

export function StatusSection({ control, isEditing }: StatusSectionProps) {
	if (!isEditing) return null

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.rosetteDiscountCheck className='h-4 w-4' />
					Estado
				</CardTitle>
				<CardDescription>Selecciona el estado del producto dentro del sistema.</CardDescription>
			</CardHeader>

			<CardContent className='grid grid-cols-1 items-start gap-4 p-0 md:grid-cols-1'>
				<UniversalFormField
					required={isEditing ? true : false}
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
