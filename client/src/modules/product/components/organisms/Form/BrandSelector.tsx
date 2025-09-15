'use client'

import { Icons } from '@/components/icons'
import { I_Brand } from '@/common/types/modules/brand'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { useEffect } from 'react' // Importar useEffect

interface BrandSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	brands: I_Brand[]
	loadingBrand: boolean
	brandSearch: string
	setBrandSearch: (search: string) => void
	brandOpen: boolean
	setBrandOpen: (open: boolean) => void
	loadMoreBrands: () => void
	currentBrand?: I_Brand // Nueva prop para la marca actual
}

export function BrandSelector({
	control,
	setValue,
	watch,
	brands,
	loadingBrand,
	brandSearch,
	setBrandSearch,
	brandOpen,
	setBrandOpen,
	currentBrand, // Nueva prop
}: BrandSelectorProps) {
	// Efecto para buscar automáticamente la marca actual cuando se abre el selector
	useEffect(() => {
		if (brandOpen && currentBrand) {
			setBrandSearch(currentBrand.name)
		}
	}, [brandOpen, currentBrand, setBrandSearch])

	const brandOptions =
		brands?.data?.items?.map(brand => ({
			value: brand.id,
			label: brand.name,
		})) || []

	// Si tenemos una marca actual que no está en las opciones, la agregamos
	const allOptions =
		currentBrand && !brandOptions.some(opt => opt.value === currentBrand.id)
			? [{ value: currentBrand.id, label: currentBrand.name }, ...brandOptions]
			: brandOptions

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.brandMedium className='h-4 w-4' />
					Marca
				</CardTitle>
				<CardDescription>Organiza tu producto en una marca específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{brands?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay marcas disponibles'
						message='Por favor, crea una marca primero antes de continuar.'
					/>
				) : (
					<UniversalFormField
						control={control}
						name='brandId'
						type='command'
						label='Selecciona una marca'
						placeholder='Buscar marca...'
						options={allOptions} // Usar allOptions en lugar de brandOptions
						commandOpen={brandOpen}
						setCommandOpen={setBrandOpen}
						commandSearchValue={brandSearch}
						setCommandSearchValue={setBrandSearch}
						commandEmptyMessage={
							loadingBrand ? <SpinnerLoader text='Buscando...' inline /> : 'No se encontrarón coincidencias'
						}
						shouldFilter={false} // manejas filtro externo
						onChange={value => {
							setValue('brandId', value, { shouldValidate: true })
						}}
					/>
				)}
			</CardContent>
		</Card>
	)
}
