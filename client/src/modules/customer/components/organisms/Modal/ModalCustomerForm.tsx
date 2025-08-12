'use client'

import { z } from 'zod'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'

import { Icons } from '@/components/icons'
import { I_Category } from '@/common/types/modules/category'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { FileUploadSection } from '@/components/layout/organims/FileUpload'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFooter } from '@/modules/category/components/organisms/Modal/FormFooter'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

// Schema de validación
const categorySchema = z.object({
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
	photo: z.string().optional(),
	removePhoto: z.boolean().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

interface CustomerFormModalProps {
	isOpen: boolean
	currentRecord: I_Category | null
	previewImage: string | null
	isUploading: boolean
	fileInputRef: React.RefObject<HTMLInputElement>
	onClose: () => void
	onSubmit: (data: CategoryFormData) => Promise<void>
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>
	onTriggerFileInput: () => void
	onClearPreview: () => void
}

export function CustomerFormModal({
	isOpen,
	currentRecord,
	previewImage,
	isUploading,
	fileInputRef,
	onClose,
	onSubmit,
	onFileChange,
	onTriggerFileInput,
	onClearPreview,
}: CustomerFormModalProps) {
	const methods = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			description: '',
			photo: '',
			removePhoto: false,
		},
	})

	const {
		handleSubmit,
		reset,
		setValue,
		watch,
		control,
		formState: { errors, isValid, isDirty },
		formState,
	} = methods

	// Efecto para cargar datos cuando se abre para editar
	React.useEffect(() => {
		if (isOpen && currentRecord) {
			reset({
				name: currentRecord.name || '',
				description: currentRecord.description || '',
				photo: currentRecord.photo?.id || '',
				removePhoto: false,
			})
		} else if (isOpen && !currentRecord) {
			reset({
				name: '',
				description: '',
				photo: '',
				removePhoto: false,
			})
		}
	}, [isOpen, currentRecord, reset])

	const removePhoto = watch('removePhoto')

	const handleFormSubmit = async (data: CategoryFormData) => {
		try {
			await onSubmit(data)
			reset()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClearPreviewWithForm = () => {
		const currentPhoto = currentRecord?.photo?.id

		// Marcar explícitamente los campos como "dirty"
		if (currentPhoto) {
			setValue('removePhoto', true, { shouldDirty: true }) // <-- Añadir shouldDirty
			setValue('photo', '', { shouldDirty: true }) // <-- Añadir shouldDirty
		} else {
			setValue('photo', '', { shouldDirty: true }) // <-- Añadir shouldDirty
			setValue('removePhoto', false, { shouldDirty: true }) // <-- Añadir shouldDirty
		}

		onClearPreview()
	}

	const handleFileChangeWithForm = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileId = await onFileChange(e)
		if (fileId) {
			setValue('photo', fileId, { shouldDirty: true }) // <-- Añadir shouldDirty
			setValue('removePhoto', false, { shouldDirty: true }) // <-- Añadir shouldDirty
		}
	}

	const handleClose = () => {
		reset()
		onClose()
	}

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='flex w-full flex-col sm:max-w-xl'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentRecord ? 'Editar Categoría' : 'Crear Categoría'}</SheetTitle>

						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								size='icon'
								disabled={onsubmit}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentRecord
							? 'Modifica los detalles de la categoría existente'
							: 'Completa los campos para crear una nueva categoría'}
					</SheetDescription>
				</SheetHeader>

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-4 overflow-auto p-4'>
						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Información básica
								</CardTitle>
								<CardDescription>Datos básicos de la categoría</CardDescription>
							</CardHeader>

							<UniversalFormField
								control={control}
								name='name'
								label='Nombre'
								placeholder='Ingresa el nombre de la categoría'
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

							<CardHeader className='mt-4 p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.media className='h-4 w-4' />
									Imagen
								</CardTitle>
								<CardDescription>Sube una imagen representativa de la categoría</CardDescription>
							</CardHeader>

							<div className='grid gap-2'>
								<FileUploadSection
									fileInputRef={fileInputRef}
									previewImage={previewImage}
									isUploading={isUploading}
									onFileChange={handleFileChangeWithForm}
									onTriggerFileInput={onTriggerFileInput}
									onClearPreview={handleClearPreviewWithForm}
									currentImage={currentRecord?.photo}
									shouldHideCurrentImage={removePhoto}
								/>
							</div>
						</Card>
					</form>
				</FormProvider>

				{/* Usar el nuevo FormFooter */}
				<FormFooter
					formState={formState}
					errors={errors}
					isValid={isValid}
					isDirty={isDirty}
					isUploading={isUploading}
					currentTemplate={currentRecord}
					onClose={handleClose}
					onSubmit={handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
