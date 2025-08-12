'use client'

import { Icons } from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { TemplateFormData } from '@/modules/template/types/template-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'

interface CategorySelectorProps {
	control: Control<TemplateFormData>
	setValue: UseFormSetValue<TemplateFormData>
	watch: UseFormWatch<TemplateFormData>
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
	setCategorySearch,
}: CategorySelectorProps) {
	const watchedCategoryId = watch('categoryId')

	const categoryOptions =
		categories?.data?.items?.map(category => ({
			value: category.id,
			label: category.name,
			icon: Icons.folder, // opcional, si quieres un icono
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Categoría
				</CardTitle>
				<CardDescription>Organiza tu plantilla en una categoría específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{categories?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay categorías disponibles'
						message='Por favor, crea una categoría antes de continuar.'
					/>
				) : (
					<UniversalFormField
						control={control}
						name='categoryId'
						label='Selecciona una categoría'
						placeholder={loadingCategories ? 'Cargando...' : 'Buscar categoría...'}
						type='command'
						options={categoryOptions}
						onChange={value => {
							setValue('categoryId', value, { shouldValidate: true })
						}}
						commandEmptyMessage={loadingCategories ? 'Buscando...' : 'No se encontraron categorías'}
					/>
				)}
			</CardContent>
		</Card>
	)
}
