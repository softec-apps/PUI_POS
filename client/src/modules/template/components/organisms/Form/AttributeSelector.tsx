'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { TemplateFormData } from '@/modules/template/types/template-form'
import { Icons } from '@/components/icons'
import { SelectedAttributesList } from './SelectedAttributesList'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { useMemo } from 'react'

interface AttributeSelectorProps {
	control: Control<TemplateFormData>
	setValue: UseFormSetValue<TemplateFormData>
	watch: UseFormWatch<TemplateFormData>
	attributes: any
	loadingAttributes: boolean
	attributeSearch: string
	setAttributeSearch: (search: string) => void
	attributeOpen: boolean
	setAttributeOpen: (open: boolean) => void
	selectedAttributes: any[]
	handleAddAttribute: (id: string) => void
}

export function AttributeSelector({
	control,
	setValue,
	watch,
	attributes,
	loadingAttributes,
	attributeSearch,
	setAttributeSearch,
	attributeOpen,
	setAttributeOpen,
	selectedAttributes,
	handleAddAttribute,
}: AttributeSelectorProps) {
	const attributeOptions =
		attributes?.data?.items?.map(attribute => ({
			value: attribute.id,
			label: attribute.name,
		})) || []

	// Obtener los IDs seleccionados del formulario
	const selectedAttributeIds = watch('atributeIds') || []

	// Mapear los IDs seleccionados a los objetos completos de atributos
	const selectedAttributesForDisplay = useMemo(() => {
		if (!attributes?.data?.items || selectedAttributeIds.length === 0) {
			return []
		}

		return selectedAttributeIds.map(id => attributes.data.items.find(attr => attr.id === id)).filter(Boolean) // Filtrar valores undefined
	}, [selectedAttributeIds, attributes?.data?.items])

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Atributos
				</CardTitle>
				<CardDescription>Selecciona los atributos que tendrá esta plantilla</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4 p-0'>
				{loadingAttributes ? (
					<div className='flex items-center justify-center py-8'>
						<SpinnerLoader />
					</div>
				) : attributes?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay atributos disponibles'
						message='Por favor, crea un atributo primero antes de continuar.'
					/>
				) : (
					<>
						<UniversalFormField
							control={control}
							name='atributeIds'
							label='Seleccionar Atributos'
							placeholder='Buscar atributos...'
							type='multi-command'
							required={true}
							options={attributeOptions}
							maxSelections={20}
							showSelectedCount={true}
							allowClearAll={true}
							groupByCategory={false}
							commandOpen={attributeOpen}
							setCommandOpen={setAttributeOpen}
							commandSearchValue={attributeSearch}
							setCommandSearchValue={setAttributeSearch}
							shouldFilter={false}
							commandEmptyMessage={
								loadingAttributes ? (
									<div className='flex items-center justify-center py-4'>
										<SpinnerLoader />
										<span className='ml-2'>Buscando...</span>
									</div>
								) : (
									'No se encontraron atributos.'
								)
							}
							onChange={(selectedIds: string[]) => {
								console.log('Atributos seleccionados:', selectedIds)
							}}
						/>
						{selectedAttributesForDisplay.length > 0 && (
							<SelectedAttributesList
								attributes={selectedAttributesForDisplay}
								onRemoveAll={() => setValue('atributeIds', [], { shouldValidate: true })}
								onRemoveAttribute={(id: string) => {
									setValue(
										'atributeIds',
										watch('atributeIds').filter(attrId => attrId !== id),
										{ shouldValidate: true }
									)
								}}
							/>
						)}
					</>
				)}
			</CardContent>
		</Card>
	)
}
