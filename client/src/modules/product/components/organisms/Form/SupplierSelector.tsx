'use client'

import { Icons } from '@/components/icons'
import { I_Supplier } from '@/common/types/modules/supplier'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod' // o la ruta que uses
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface SupplierSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	suppliers: I_Supplier[]
	loadingSupplier: boolean
	supplierSearch: string
	setSupplierSearch: (search: string) => void
	supplierOpen: boolean
	setSupplierOpen: (open: boolean) => void
	loadMoreSupplier: () => void
}

export function SupplierSelector({
	control,
	setValue,
	watch,
	suppliers,
	loadingSupplier,
	supplierSearch,
	setSupplierSearch,
	supplierOpen,
	setSupplierOpen,
}: SupplierSelectorProps) {
	const supplierOptions =
		suppliers?.data?.items?.map(supplier => ({
			value: supplier.id,
			label: supplier.legalName,
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.truck className='h-4 w-4' />
					Proveedor
				</CardTitle>
				<CardDescription>Organiza tu producto en un proveedor específico</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{suppliers?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay proveedores disponibles'
						message='Por favor, crea un proveedor primero antes de continuar.'
					/>
				) : (
					<UniversalFormField
						control={control}
						name='supplierId'
						type='command'
						label='Selecciona un proveedor'
						placeholder='Buscar proveedor...'
						options={supplierOptions}
						commandOpen={supplierOpen}
						setCommandOpen={setSupplierOpen}
						commandSearchValue={supplierSearch}
						setCommandSearchValue={setSupplierSearch}
						commandEmptyMessage={
							loadingSupplier ? <SpinnerLoader text='Buscando...' inline /> : 'No se encontrarón coincidencias'
						}
						shouldFilter={false} // manejas filtro externo
						onChange={value => {
							setValue('supplierId', value, { shouldValidate: true })
						}}
					/>
				)}
			</CardContent>
		</Card>
	)
}
