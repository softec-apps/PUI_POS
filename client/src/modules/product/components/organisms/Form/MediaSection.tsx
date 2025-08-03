'use client'

import { Icons } from '@/components/icons'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploadSection } from '@/components/layout/organims/FileUpload'
import { useFileUpload } from '@/common/hooks/useFileUpload'
import { ChangeEvent, useEffect } from 'react'

interface MediaSectionProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	productData?: any
	currentRecord?: any
}

export function MediaSection({ control, setValue, watch, productData, currentRecord }: MediaSectionProps) {
	const { previewImage, isUploading, fileInputRef, uploadFile, clearPreview, triggerFileInput, setPreviewImage } =
		useFileUpload({
			showPreview: true,
			// maxSize y allowedTypes usarán los valores por defecto del hook
		})

	// Observar el campo photo del formulario
	const currentPhoto = watch('photo')
	const removePhoto = watch('removePhoto')

	// Obtener la imagen completa del productData si está disponible
	const getImageForDisplay = () => {
		// Si tenemos productData y tiene photo como objeto, usarlo
		if (productData?.photo && typeof productData.photo === 'object') {
			return productData.photo
		}
		// Si tenemos currentRecord y tiene photo como objeto, usarlo
		if (currentRecord?.photo && typeof currentRecord.photo === 'object') {
			return currentRecord.photo
		}
		// Si currentPhoto ya es un objeto con path, usarlo directamente
		if (currentPhoto && typeof currentPhoto === 'object' && currentPhoto.path) {
			return currentPhoto
		}
		// Si solo tenemos el ID, crear objeto con el ID y null para path
		if (currentPhoto && typeof currentPhoto === 'string') {
			return { id: currentPhoto, path: null }
		}
		return null
	}

	const imageForDisplay = getImageForDisplay()

	// Sincronizar la imagen existente con el hook cuando el formulario se inicializa
	useEffect(() => {
		// Extraer el ID de la foto para el formulario
		let photoId = ''
		if (currentPhoto && typeof currentPhoto === 'object' && currentPhoto.id) {
			photoId = currentPhoto.id
		} else if (currentPhoto && typeof currentPhoto === 'string') {
			photoId = currentPhoto
		}

		// Si el valor actual del formulario no coincide con el ID extraído, actualizarlo
		if (photoId && photoId !== (typeof currentPhoto === 'string' ? currentPhoto : '')) {
			setValue('photo', photoId, { shouldValidate: true })
		}

		// Manejar el preview de la imagen
		if (photoId && !removePhoto && imageForDisplay?.path) {
			if (!previewImage) {
				setPreviewImage(imageForDisplay.path)
			}
		} else if (removePhoto || !photoId) {
			if (previewImage) {
				setPreviewImage(null)
			}
		}
	}, [currentPhoto, removePhoto, setPreviewImage, imageForDisplay?.path, previewImage, setValue])

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<string | null> => {
		const file = e.target.files?.[0]
		if (!file) return null

		const uploadedFileId = await uploadFile(file)

		// Setear el ID de la imagen en el formulario
		if (uploadedFileId) {
			setValue('photo', uploadedFileId, { shouldValidate: true })
			setValue('removePhoto', false, { shouldValidate: true })
		}

		return uploadedFileId
	}

	const handleClearPreview = () => {
		clearPreview()
		setValue('photo', '', { shouldValidate: true })
		setValue('removePhoto', true, { shouldValidate: true })
	}

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.media className='h-4 w-4' />
					Imagen
				</CardTitle>
				<CardDescription>Sube una imagen representativa del producto</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				<div className='space-y-2'>
					<FileUploadSection
						fileInputRef={fileInputRef}
						previewImage={previewImage}
						currentImage={imageForDisplay}
						isUploading={isUploading}
						onFileChange={handleFileChange}
						onTriggerFileInput={triggerFileInput}
						onClearPreview={handleClearPreview}
						shouldHideCurrentImage={removePhoto || false}
					/>
				</div>

				{/* Campo oculto para almacenar el ID de la foto */}
				<UniversalFormField control={control} name='photo' type='hidden' />

				{/* Campo oculto para el flag de removePhoto */}
				<UniversalFormField control={control} name='removePhoto' type='hidden' />
			</CardContent>
		</Card>
	)
}
