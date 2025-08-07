'use client'

import { cn } from '@/lib/utils'
import { ChangeEvent } from 'react'
import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { bytesToMB } from '@/common/utils/fileSizeTransform-util'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/common/constants/file-const'

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
	imageHeight?: number
	imageWidth?: number
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
	imageHeight = 250,
	imageWidth = 550,
}: FileUploadSectionProps) => {
	const getImageUrl = (image: string | ImageObject | null): string | null => {
		if (!image) return null
		if (typeof image === 'string') return image
		return image.path || null
	}

	const currentImageUrl = shouldHideCurrentImage ? null : getImageUrl(currentImage)
	const displayImage = previewImage || currentImageUrl

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => await onFileChange(e)

	return (
		<div className='space-y-4'>
			<input type='file' ref={fileInputRef} onChange={handleFileChange} accept='image/*' className='hidden' />

			{!displayImage ? (
				<Card
					onClick={onTriggerFileInput}
					className={cn(
						'border-muted-foreground/30 cursor-pointer rounded-xl border-2 border-dashed p-7 text-center transition-all',
						'hover:bg-muted/10',
						isUploading ? 'pointer-events-none opacity-70' : ''
					)}>
					{isUploading ? (
						<div className='m-1 p-16'>
							<SpinnerLoader text='Subiendo imagen...' />
						</div>
					) : (
						<div className='flex flex-col items-center gap-4 p-5'>
							<div className='bg-muted/50 rounded-full p-4'>
								<Icons.upload className='text-muted-foreground h-6 w-6' />
							</div>

							<div>
								<Typography variant='p'>Buscar archivo</Typography>

								<div className='space-y-2'>
									<Typography variant='small'>
										Formatos: {ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '')).join(', ')}
									</Typography>

									<Typography variant='small'>Máx. {bytesToMB(MAX_FILE_SIZE.SMALL)} MB</Typography>
								</div>
							</div>
						</div>
					)}
				</Card>
			) : (
				<div className='flex w-full flex-col items-center justify-center space-y-4'>
					<ImageControl
						imageUrl={displayImage}
						alt='Vista previa'
						imageHeight={imageHeight}
						imageWidth={imageWidth}
						enableHover={false}
						enableClick={false}
						className='h-auto w-full object-cover object-center'
					/>

					<div className='flex justify-end gap-2'>
						<ActionButton
							onClick={onClearPreview}
							disabled={isUploading}
							size='sm'
							variant='ghost'
							text='Remover'
							icon={<Icons.trash className='h-4 w-4' />}
							className='text-destructive hover:text-destructive'
						/>

						<ActionButton
							onClick={onTriggerFileInput}
							disabled={isUploading}
							size='sm'
							variant='default'
							text={isUploading ? 'Subiendo...' : 'Cambiar imagen'}
							icon={
								isUploading ? (
									<Icons.spinnerSimple className='h-4 w-4 animate-spin' />
								) : (
									<Icons.upload className='h-4 w-4' />
								)
							}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
