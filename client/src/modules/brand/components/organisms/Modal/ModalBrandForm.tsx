'use client'

import { z } from 'zod'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'

import { Icons } from '@/components/icons'
import { I_Brand } from '@/modules/brand/types/brand'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { FormFooter } from '@/modules/brand/components/organisms/Modal/FormFooter'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Schema de validación
const BrandSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	description: z
		.string()
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(255, 'La descripción no puede exceder 255 caracteres')
		.optional()
		.or(z.literal('')),
})

export type BrandFormData = z.infer<typeof BrandSchema>

interface Props {
	isOpen: boolean
	currentBrand: I_Brand | null  // CAMBIO: tipo específico
	previewImage: string | null
	isUploading: boolean
	fileInputRef: React.RefObject<HTMLInputElement>
	onClose: () => void
	onSubmit: (data: BrandFormData) => Promise<void>
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>
	onTriggerFileInput: () => void
	onClearPreview: () => void
}

export function BrandFormModal({
	isOpen,
	currentBrand,
	isUploading,
	onClose,
	onSubmit,
}: Props) {
	const methods = useForm<BrandFormData>({
		resolver: zodResolver(BrandSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			description: '',
		},
	})

	const {
		handleSubmit,
		reset,
		control,
		formState: { errors, isValid, isDirty },
		formState,
	} = methods

	// Efecto para cargar datos cuando se abre para editar
	React.useEffect(() => {
		console.log('Form effect triggered:', { isOpen, currentBrand }) // Debug log
		
		if (isOpen && currentBrand) {
			// CAMBIO: Asegurarse de que los valores se establezcan correctamente
			const formData = {
				name: currentBrand.name || '',
				description: currentBrand.description || '',
			}
			console.log('Setting form data:', formData) // Debug log
			reset(formData)
		} else if (isOpen && !currentBrand) {
			// Limpiar form para crear nuevo
			const emptyData = {
				name: '',
				description: '',
			}
			console.log('Clearing form data') // Debug log
			reset(emptyData)
		}
	}, [isOpen, currentBrand, reset])

	const handleFormSubmit = async (data: BrandFormData) => {
		try {
			console.log('Form submitted with data:', data) // Debug log
			await onSubmit(data)
			// No resetear aquí, se hace en el onClose
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		reset({
			name: '',
			description: '',
		})
		onClose()
	}

	// CAMBIO: Agregar debug para verificar los valores actuales
	const currentValues = methods.watch()
	console.log('Current form values:', currentValues) // Debug log

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-xl flex-col [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentBrand ? 'Editar Marca' : 'Crear Marca'}</SheetTitle>

						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={handleClose}
								size='icon'
								disabled={isUploading}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentBrand
							? 'Modifica los detalles de la marca existente'
							: 'Completa los campos para crear una nueva marca'}
					</SheetDescription>
				</SheetHeader>

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-4 overflow-auto p-4'>
						<Card className='border-none bg-transparent p-0 shadow-none'>
							<AlertMessage
								message={
									currentBrand
										? 'Modifica los campos necesarios y guarda los cambios para actualizar la marca en el sistema.'
										: 'Completa la información requerida para crear una nueva marca. El nombre es obligatorio, mientras que la descripción es opcional.'
								}
								variant='info'
							/>

							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Información básica
								</CardTitle>
								<CardDescription>Datos básicos de la marca</CardDescription>
							</CardHeader>

							<UniversalFormField
								control={control}
								name='name'
								label='Nombre'
								placeholder='Ingresa el nombre de la marca'
								type='text'
								required={true}
								showValidationIcons={true}
							/>

							<UniversalFormField
								control={control}
								name='description'
								label='Descripción'
								placeholder='Descripción opcional'
								type='textarea'
								required={false}
								showValidationIcons={true}
							/>
						</Card>
					</form>
				</FormProvider>

				{/* Usar el FormFooter */}
				<FormFooter
					formState={formState}
					errors={errors}
					isValid={isValid}
					isDirty={isDirty}
					isUploading={isUploading}
					currentTemplate={currentBrand}
					onClose={handleClose}
					onSubmit={handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}