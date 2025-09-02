'use client'

import { Icons } from '@/components/icons'
import { Control } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { taxLabelsTraslateToEs, TaxAllow } from '@/modules/product/constants/product.constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EconomicSectionProps {
	control: Control<ProductFormData>
}

// Crear las opciones usando directamente los valores del enum como strings
const typeOptions = [
	{ value: TaxAllow.EXENTO.toString(), label: taxLabelsTraslateToEs[TaxAllow.EXENTO] },
	{ value: TaxAllow.CON_IVA.toString(), label: taxLabelsTraslateToEs[TaxAllow.CON_IVA] },
]

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
			<CardContent className='grid grid-cols-1 gap-6 p-0'>
				{/* Fila 1: Costo, Stock, Impuesto */}
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
					<UniversalFormField
						required
						control={control}
						name='price'
						type='number'
						label='Costo'
						placeholder='Ej: 6.123456'
						description='Costo del producto'
					/>
					<UniversalFormField
						required
						control={control}
						name='pricePublic'
						type='number'
						label='Precio de venta'
						placeholder='Ej: 7.123456'
						description='Precio de venta'
					/>
					<UniversalFormField
						required
						control={control}
						name='tax'
						type='select'
						options={typeOptions}
						label='Impuesto'
					/>
				</div>
				{/* Fila 2: SKU, Código de barras */}
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
					<UniversalFormField
						control={control}
						name='barCode'
						type='text'
						label='Código de barras'
						placeholder='Ej: 1234567890123'
					/>
					<UniversalFormField control={control} name='sku' type='text' label='SKU' placeholder='Ej: SKU-12345' />
					<UniversalFormField
						required
						control={control}
						name='stock'
						type='number'
						label='Stock'
						placeholder='Ej: 666'
					/>
				</div>
			</CardContent>
		</Card>
	)
}
