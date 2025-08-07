'use client'

import { z } from 'zod'
import { useEffect } from 'react'
import { Icons } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { I_Attribute } from '@/common/types/modules/attribute'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { FormFooter } from '@/modules/atribute/components/organisms/Modal/FormFooter'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { AttributeTypeAllow, typeLabelsTraslateToEs } from '@/modules/atribute/enums/attribute-types-allow.enum'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Schema de validación
const attributeSchema = z.object({
	name: z.string().min(1, 'No puede estar vacío').min(3, 'Mínimo 3 caracteres').max(50, 'Límite excedido'),
	type: z.nativeEnum(AttributeTypeAllow, {
		errorMap: () => ({ message: `El tipo debe ser uno de: ${Object.values(AttributeTypeAllow).join(', ')}` }),
	}),
	options: z.array(z.string().min(1, 'Cada opción debe ser un string')).optional(),
	required: z.boolean({ message: 'Debe ser un valor booleano (true o false)' }),
})

export type AttributeFormData = z.infer<typeof attributeSchema>

interface Props {
	isOpen: boolean
	currentRecord: I_Attribute | null
	onClose: () => void
	onSubmit: (data: AttributeFormData) => Promise<void>
}

const typeOptions = Object.entries(typeLabelsTraslateToEs).map(([value, label]) => ({
	value,
	label,
}))

export function AttributeFormModal({ isOpen, currentRecord, onClose, onSubmit }: Props) {
	const methods = useForm<AttributeFormData>({
		resolver: zodResolver(attributeSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			type: AttributeTypeAllow.TEXT,
			options: undefined,
			required: false,
		},
	})

	const { handleSubmit, reset, control, formState } = methods

	const { errors, isSubmitting, isValid, isDirty } = formState

	// Efecto para cargar datos cuando se abre para editar
	useEffect(() => {
		if (isOpen && currentRecord) {
			reset({
				name: currentRecord.name || '',
				type: currentRecord.type || AttributeTypeAllow.TEXT,
				options: currentRecord.options || undefined,
				required: currentRecord.required || false,
			})
		} else if (isOpen && !currentRecord) {
			reset({
				name: '',
				type: AttributeTypeAllow.TEXT,
				options: undefined,
				required: false,
			})
		}
	}, [isOpen, currentRecord, reset])

	const handleFormSubmit = async (data: AttributeFormData) => {
		try {
			const submitData = {
				...data,
			}

			await onSubmit(submitData)

			// Limpiar formulario después del envío exitoso
			reset({
				name: '',
				type: AttributeTypeAllow.TEXT,
				options: undefined,
				required: false,
			})
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		// Limpiar formulario y estado
		reset({
			name: '',
			type: AttributeTypeAllow.TEXT,
			options: undefined,
			required: false,
		})
		onClose()
	}

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='flex max-h-screen min-w-xl flex-col'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentRecord ? 'Editar atributo' : 'Crear atributo'}</SheetTitle>
						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={onClose}
								size='icon'
								disabled={onsubmit}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentRecord
							? 'Modifica los campos del atributo existente'
							: 'Completa los campos para crear un nuevo atributo'}
					</SheetDescription>
				</SheetHeader>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-6 overflow-auto p-4'>
						<AlertMessage
							message={
								currentRecord
									? 'Modifica los campos necesarios y guarda los cambios para actualizar este atributo. Los cambios afectarán a todas las plantillas y productos que utilicen este atributo.'
									: 'Los atributos definen características específicas de productos (como color, tamaño, material, etc.) y se utilizan para construir plantillas de productos.'
							}
							variant='info'
						/>

						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Información básica
								</CardTitle>
								<CardDescription>Datos básicos del atributo</CardDescription>
							</CardHeader>

							<CardContent className='space-y-4 p-0'>
								<UniversalFormField
									control={control}
									name='name'
									label='Nombre'
									placeholder='Ej. Meterial'
									type='text'
									required={true}
									showValidationIcons={true}
								/>

								<UniversalFormField
									control={control}
									name='type'
									label='Tipo de dato'
									placeholder='Selecciona un tipo'
									type='select'
									required={true}
									options={typeOptions}
									showValidationIcons={true}
									description='Define el tipo de dato que almacenará este atributo'
								/>
							</CardContent>
						</Card>

						<Card className='border-none bg-transparent p-0 pt-8 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Requerido
								</CardTitle>
								<CardDescription>Activar si es un campo obligatorio</CardDescription>
							</CardHeader>

							<CardContent className='space-y-4 p-0'>
								<UniversalFormField
									control={control}
									name='required'
									label='Campo requerido'
									type='switch'
									description='Marca si este campo será obligatorio para completar'
									showValidationIcons={false}
								/>
							</CardContent>
						</Card>
					</form>
				</FormProvider>

				<FormFooter
					formState={formState}
					errors={errors}
					isValid={isValid}
					isDirty={isDirty}
					currentRecord={currentRecord}
					onClose={handleClose}
					onSubmit={handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
