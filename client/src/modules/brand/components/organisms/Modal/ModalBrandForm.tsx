'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'

import { Icons } from '@/components/icons'
import { I_Brand } from '@/common/types/modules/brand'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { FormFooter } from '@/modules/brand/components/organisms/Modal/FormFooter'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandSchema, BrandFormData } from '@/modules/brand/types/template-form'

interface Props {
	isOpen: boolean
	currentBrand: I_Brand | null
	previewImage: string | null
	isUploading: boolean
	fileInputRef: React.RefObject<HTMLInputElement>
	onClose: () => void
	onSubmit: (data: BrandFormData) => Promise<void>
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>
	onTriggerFileInput: () => void
	onClearPreview: () => void
}

export function BrandFormModal({ isOpen, currentBrand, isUploading, onClose, onSubmit }: Props) {
	const methods = useForm<BrandFormData>({
		resolver: zodResolver(BrandSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			description: '',
			icon: '',
		},
	})

	const {
		handleSubmit,
		reset,
		formState: { errors, isValid, isDirty },
		formState,
	} = methods

	// Efecto para cargar datos cuando se abre para editar
	React.useEffect(() => {
		if (isOpen && currentBrand) {
			const formData = {
				name: currentBrand.name || '',
				description: currentBrand.description || '',
				icon: currentBrand.icon || '',
			}

			reset(formData)
		} else if (isOpen && !currentBrand) {
			// Limpiar form para crear nuevo
			const emptyData = {
				name: '',
				description: '',
				icon: '',
			}

			reset(emptyData)
		}
	}, [isOpen, currentBrand, reset])

	const handleFormSubmit = async (data: BrandFormData) => {
		try {
			await onSubmit(data)
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		reset({
			name: '',
			description: '',
			icon: '',
		})
		onClose()
	}

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
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Información básica
								</CardTitle>
								<CardDescription>Datos básicos de la marca</CardDescription>
							</CardHeader>

							<UniversalFormField
								control={methods.control}
								name='name'
								label='Nombre'
								placeholder='Ingresa el nombre de la marca'
								type='text'
								required={true}
								showValidationIcons={true}
							/>

							{/* 
							<UniversalFormField
								control={methods.control}
								name='icon'
								label='Ícono'
								type='select'
								options={PRODUCT_BRAND_ICONS}
								groupByCategory={true}
								showIconsInSelect={true}
								placeholder='Selecciona un ícono que represente tu marca'
							/>
							*/}

							<UniversalFormField
								control={methods.control}
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
