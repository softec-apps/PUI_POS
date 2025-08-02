'use client'
import { Icons } from '@/components/icons'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploadSection } from '@/modules/product/components/organisms/FileUpload'
import { useFileUpload } from '@/common/hooks/useFileUpload'
import { ChangeEvent } from 'react'

interface MediaSectionProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
}

export function MediaSection({ control, setValue, watch }: MediaSectionProps) {
	const { previewImage, isUploading, fileInputRef, uploadFile, clearPreview, triggerFileInput, setPreviewImage } =
		useFileUpload({
			showPreview: true,
			// maxSize y allowedTypes usarán los valores por defecto del hook
		})

	// Observar el campo photo del formulario
	const currentPhoto = watch('photo')

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
					<Icons.infoCircle className='h-4 w-4' />
					Imagen del producto
				</CardTitle>
				<CardDescription>Sube una imagen representativa del producto</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				<div className='space-y-2'>
					<FileUploadSection
						fileInputRef={fileInputRef}
						previewImage={previewImage}
						currentImage={currentPhoto}
						isUploading={isUploading}
						onFileChange={handleFileChange}
						onTriggerFileInput={triggerFileInput}
						onClearPreview={handleClearPreview}
						shouldHideCurrentImage={false}
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
