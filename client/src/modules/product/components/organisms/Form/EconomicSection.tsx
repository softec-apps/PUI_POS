'use client'

import { Icons } from '@/components/icons'
import { Control } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { STATUS_OPTIONS } from '@/modules/product/constants/product.constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EconomicSectionProps {
	control: Control<ProductFormData>
}

export function EconomicSection({ control }: EconomicSectionProps) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Información económica
				</CardTitle>
				<CardDescription>Datos económicos y logísticos del producto</CardDescription>
			</CardHeader>

			<CardContent className='space-y-6 p-0'>
				<UniversalFormField
					required
					control={control}
					name='price'
					type='number'
					label='Precio'
					placeholder='Ej: 6.123456'
					description='Precio base del producto'
				/>

				<UniversalFormField
					required
					control={control}
					name='stock'
					type='number'
					label='Stock'
					placeholder='Ej: 666'
					description='Stock inicial del producto'
				/>

				{/* 
				<UniversalFormField
					control={control}
					name='sku'
					type='text'
					label='SKU'
					placeholder='Ej: SKU-12345'
					max={20}
					description='SKU del producto'
				/>
				*/}

				<UniversalFormField
					control={control}
					name='barCode'
					type='text'
					label='Código de barras'
					placeholder='Ej: 1234567890123'
					max={50}
					description='Código de barras del producto'
				/>

				<UniversalFormField
					required
					control={control}
					name='status'
					type='select'
					label='Estado'
					placeholder='Selecciona el estado'
					description='Define el estado del producto'
					options={STATUS_OPTIONS}
				/>
			</CardContent>
		</Card>
	)
}
