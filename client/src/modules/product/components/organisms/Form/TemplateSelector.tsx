'use client'

import { Icons } from '@/components/icons'
import { I_Template } from '@/common/types/modules/template'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface TemplateSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	templates: I_Template[]
	loadingTemplates: boolean
	templateSearch: string
	setTemplateSearch: (search: string) => void
	templateOpen: boolean
	setTemplateOpen: (open: boolean) => void
	loadMoreTemplates: () => void
}

export function TemplateSelector({
	control,
	setValue,
	watch,
	templates,
	loadingTemplates,
	templateSearch,
	setTemplateSearch,
	templateOpen,
	setTemplateOpen,
}: TemplateSelectorProps) {
	const templateOptions =
		templates?.data?.items?.map(template => ({
			value: template.id,
			label: template.name,
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.boxModel2 className='h-4 w-4' />
					Plantilla
				</CardTitle>
				<CardDescription>Organiza tu producto en una plantilla específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{templates?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay plantillas disponibles'
						message='Por favor, crea una plantilla primero antes de continuar.'
					/>
				) : (
					<UniversalFormField
						control={control}
						name='templateId'
						type='command'
						label='Selecciona una plantilla'
						placeholder='Buscar plantilla...'
						options={templateOptions}
						commandOpen={templateOpen}
						setCommandOpen={setTemplateOpen}
						commandSearchValue={templateSearch}
						setCommandSearchValue={setTemplateSearch}
						commandEmptyMessage={
							loadingTemplates ? <SpinnerLoader text='Buscando...' inline /> : 'No se encontrarón coincidencias'
						}
						shouldFilter={false} // filtro manejado externamente
						onChange={value => {
							setValue('templateId', value, { shouldValidate: true })
						}}
					/>
				)}
			</CardContent>
		</Card>
	)
}
