'use client'

import { Icons } from '@/components/icons'
import { Control } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
	control: Control<ProductFormData>
}

export function BasicInfoSection({ control }: Props) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Información básica
				</CardTitle>
				<CardDescription>Datos básicos del producto</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				<UniversalFormField
					required
					control={control}
					name='name'
					type='text'
					label='Nombre'
					placeholder='Ej: Plantilla de Producto Básico'
					max={255}
				/>

				<UniversalFormField
					control={control}
					name='description'
					type='textarea'
					label='Descripción'
					placeholder='Describe el propósito y uso de esta plantilla...'
					max={2000}
				/>
			</CardContent>
		</Card>
	)
}
