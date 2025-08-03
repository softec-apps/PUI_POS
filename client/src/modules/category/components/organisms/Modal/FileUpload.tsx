'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ChangeEvent } from 'react'
import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { bytesToMB } from '@/common/utils/fileSizeTransform-util'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/common/constants/file-const'
import { ImageControl } from '@/components/layout/organims/ImageControl'

interface ImageObject {
	path: string
	id?: string
}

interface FileUploadSectionProps {
	fileInputRef: React.RefObject<HTMLInputElement>
	previewImage: string | null
	currentImage: string | ImageObject | null
	isUploading: boolean
	onFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<string | null>
	onTriggerFileInput: () => void
	onClearPreview: () => void
	shouldHideCurrentImage?: boolean
}

export const FileUploadSection = ({
	fileInputRef,
	previewImage,
	isUploading,
	onFileChange,
	onClearPreview,
	onTriggerFileInput,
	currentImage,
	shouldHideCurrentImage = false,
}: FileUploadSectionProps) => {
	// Función para normalizar la imagen (maneja tanto string como objeto)
	const getImageUrl = (image: string | ImageObject | null): string | null => {
		if (!image) return null
		if (typeof image === 'string') return image
		return image.path || null
	}

	const currentImageUrl = shouldHideCurrentImage ? null : getImageUrl(currentImage)
	const displayImage = previewImage || currentImageUrl

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => await onFileChange(e)

	return (
		<>
			<input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />

			{!displayImage ? (
				<Card
					onClick={onTriggerFileInput}
					className={cn(
						'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all',
						'hover:bg-muted/20',
						isUploading ? 'pointer-events-none opacity-70' : ''
					)}>
					{isUploading ? (
						<SpinnerLoader text='Subiendo imagen...' />
					) : (
						<div className='flex flex-col items-center justify-center'>
							<div className='flex flex-col items-center space-y-2'>
								<Icons.upload className='text-muted-foreground' />
								<Typography variant='p'>Arrastra una imagen o haz clic</Typography>
							</div>

							<div className='space-y-1'>
								<Typography variant='span' className='text-sm'>
									Formatos aceptados: {ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '')).join(', ')}
								</Typography>

								<Typography variant='small' className='text-muted-foreground text-xs'>
									Tamaño máximo: {bytesToMB(MAX_FILE_SIZE.SMALL)} MB
								</Typography>
							</div>
						</div>
					)}
				</Card>
			) : (
				<div className='group relative'>
					<ImageControl
						imageUrl={displayImage}
						alt='Vista previa'
						imageHeight={300}
						imageWidth={550}
						enableHover={false}
						enableClick={false}
						className='h-auto w-full object-cover object-center'
					/>

					<div className='absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
						<ActionButton
							onClick={onClearPreview}
							disabled={isUploading}
							size='icon'
							variant='destructive'
							tooltip='Remover imagen'
							icon={<Icons.x />}
						/>
					</div>

					<div className='mt-2 flex justify-end'>
						<ActionButton
							onClick={onTriggerFileInput}
							disabled={isUploading}
							className='w-full'
							variant='secondary'
							text={isUploading ? 'Procesando...' : 'Cambiar imagen'}
							icon={isUploading ? <Icons.spinnerSimple className='h-4 w-4 animate-spin' /> : undefined}
						/>
					</div>
				</div>
			)}
		</>
	)
}
