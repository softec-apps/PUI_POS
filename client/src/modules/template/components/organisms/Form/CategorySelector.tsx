'use client'

import { Icons } from '@/components/icons'
import { I_Category } from '@/common/types/modules/category'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface CategorySelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	categories: I_Category[]
	loadingCategories: boolean
	categorySearch: string
	setCategorySearch: (search: string) => void
	categoryOpen: boolean
	setCategoryOpen: (open: boolean) => void
	loadMoreCategories: () => void
}

export function CategorySelector({
	control,
	setValue,
	watch,
	categories,
	loadingCategories,
	categorySearch,
	setCategorySearch,
	categoryOpen,
	setCategoryOpen,
}: CategorySelectorProps) {
	const categoryOptions =
		categories?.data?.items?.map(category => ({
			value: category.id,
			label: category.name,
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.listDetails className='h-4 w-4' />
					Categoría
				</CardTitle>
				<CardDescription>Organiza tu plantilla en una categoría específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{categories?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay categorías disponibles'
						message='Por favor, crea una categoría primero antes de continuar.'
					/>
				) : (
					<UniversalFormField
						required
						control={control}
						name='categoryId'
						type='command'
						label='Selecciona una categoría'
						placeholder='Buscar categoría...'
						options={categoryOptions}
						commandEmptyMessage={
							loadingCategories ? <SpinnerLoader text='Buscando...' inline /> : 'No se encontrarón coincidencias'
						}
						shouldFilter={false} // Desactivar filtrado interno ya que se maneja externamente
						commandOpen={categoryOpen}
						setCommandOpen={setCategoryOpen}
						commandSearchValue={categorySearch}
						setCommandSearchValue={setCategorySearch}
						onChange={value => {
							setValue('categoryId', value, { shouldValidate: true })
						}}
					/>
				)}
			</CardContent>
		</Card>
	)
}
