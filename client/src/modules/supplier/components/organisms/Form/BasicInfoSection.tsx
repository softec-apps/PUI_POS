'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { SupplierFormData } from '@/modules/supplier/types/supplier-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BasicInfoSectionProps {
	control: Control<SupplierFormData>
}

export function BasicInfoSection({ control }: BasicInfoSectionProps) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			{/* 
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Datos generales
				</CardTitle>
				<CardDescription>Completa los datos generales de la categoría</CardDescription>
			</CardHeader>
			*/}

			<CardContent className='grid grid-cols-1 items-start gap-4 space-y-2 p-0 md:grid-cols-1'>
				<UniversalFormField
					required
					control={control}
					name='ruc'
					label='RUC'
					placeholder='Ej. 1790012345001'
					type='text'
					showValidationIcons={true}
				/>

				<UniversalFormField
					required
					control={control}
					name='legalName'
					label='Razón social (nombre legal)'
					placeholder='Ej. COMERCIALIZADORA ANDINA S.A.'
					type='text'
				/>

				<UniversalFormField
					control={control}
					name='commercialName'
					label='Nombre comercial'
					placeholder='Ej. DISTRIANDINA'
					type='text'
				/>
			</CardContent>
		</Card>
	)
}
