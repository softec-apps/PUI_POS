'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { CategoryFormData } from '@/modules/category/types/category-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BasicInfoSectionProps {
	control: Control<CategoryFormData>
}

export function BasicInfoSection({ control }: BasicInfoSectionProps) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Datos generales
				</CardTitle>
				<CardDescription>Completa los datos generales de la categoría</CardDescription>
			</CardHeader>

			<CardContent className='grid grid-cols-1 items-start gap-4 space-y-2 p-0 md:grid-cols-1'>
				<UniversalFormField
					required
					control={control}
					name='name'
					type='text'
					label='Nombre'
					placeholder='Ej: Libros'
				/>

				<UniversalFormField
					control={control}
					name='description'
					type='textarea'
					label='Descripción'
					placeholder='Escribe la descripcion...'
				/>
			</CardContent>
		</Card>
	)
}
