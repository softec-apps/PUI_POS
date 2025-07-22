'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { I_Category } from '@/modules/category/types/category'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/common/utils/dateFormater-util'

interface Props {
	categoryData: I_Category
}

export const CategoryImage = ({ categoryData }: Props) => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [imageLoaded, setImageLoaded] = useState(false)
	const [imageError, setImageError] = useState(false)
	const [isDownloading, setIsDownloading] = useState(false)

	// Función mejorada para cerrar modal
	const closeModal = useCallback(() => {
		setIsModalOpen(false)
		setImageLoaded(false)
		setImageError(false)
	}, [])

	// Manejo de eventos de teclado mejorado
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isModalOpen) return

			switch (e.key) {
				case 'Escape':
					closeModal()
					break
				case 'd':
				case 'D':
					e.preventDefault()
					handleDownload()
					break
				case 's':
				case 'S':
					e.preventDefault()
					handleShare()
					break
			}
		}

		if (isModalOpen) {
			document.addEventListener('keydown', handleKeyDown)
			document.body.style.overflow = 'hidden'
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = 'unset'
		}
	}, [isModalOpen, closeModal])

	// Función de descarga mejorada con manejo de errores
	const handleDownload = async () => {
		if (!categoryData?.photo?.path || isDownloading) return

		setIsDownloading(true)
		try {
			const response = await fetch(categoryData.photo.path)

			if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')

			// Obtener extensión del archivo o usar jpg por defecto
			const fileExtension = categoryData.photo.path.split('.').pop()?.toLowerCase()
			const fileName = `${categoryData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExtension}`

			link.href = url
			link.download = fileName
			link.style.display = 'none'

			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)

			toast.success('La imagen se ha descargado correctamente.')
		} catch (error) {
			console.error('Error al descargar:', error)
			toast.error('Error al descargar.')
		} finally {
			setIsDownloading(false)
		}
	}

	// Función de compartir mejorada
	const handleShare = async () => {
		if (!categoryData?.photo?.path) return

		try {
			if (navigator.share && navigator.canShare) {
				const shareData = {
					title: categoryData.name,
					text: `Mira esta imagen: ${categoryData.name}`,
					url: categoryData.photo.path,
				}

				if (navigator.canShare(shareData)) {
					await navigator.share(shareData)
					return
				}
			}

			// Fallback: copiar al portapapeles
			await navigator.clipboard.writeText(categoryData.photo.path)
			toast.success('El enlace de la imagen se ha copiado al portapapeles.')
		} catch (error) {
			console.error('Error al compartir:', error)
			toast.error('Error al descargar.')
		}
	}

	// Manejo de errores de imagen
	const handleImageError = useCallback(() => {
		setImageError(true)
		setImageLoaded(true)
	}, [])

	const handleImageLoad = useCallback(() => {
		setImageError(false)
		setImageLoaded(true)
	}, [])

	if (categoryData?.photo?.path) {
		return (
			<>
				{/* Miniatura clickeable */}
				<div className='flex w-full justify-center'>
					<Card
						className='group relative cursor-zoom-in overflow-hidden border-none bg-transparent p-0 transition-all duration-300 hover:shadow-xl hover:shadow-black/20'
						onClick={() => setIsModalOpen(true)}>
						<CardContent className='p-0'>
							<div className='relative h-16 w-28 overflow-hidden rounded-lg'>
								<Image
									src={categoryData.photo.path}
									alt={`Imagen de ${categoryData.name}`}
									className='bg-muted/20 object-contain transition-transform duration-500 group-hover:scale-110'
									fill
									unoptimized
									quality={10}
									onContextMenu={e => e.preventDefault()}
								/>
							</div>

							{/* Info badge mejorado */}
							<div className='absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 transition-transform duration-300 group-hover:translate-y-0'>
								<div className='space-y-0.5'>
									<p className='truncate text-xs leading-tight font-medium text-white'>{categoryData.name}</p>
									{categoryData.createdAt && (
										<div className='flex items-center space-x-1'>
											<Icons.calendar className='h-3 w-3 text-white/60' />
											<p className='text-xs text-white/80'>{formatDate(categoryData.createdAt, true)}</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Detalles */}
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className='rounded-lg p-0 sm:max-w-2xl md:max-w-4xl lg:max-w-5xl'>
						<div className='flex h-full flex-col md:flex-row'>
							{/* Contenedor de imagen principal */}
							<div className='bg-background relative flex flex-1 items-center justify-center overflow-hidden md:rounded-l-lg'>
								{imageError ? (
									<div className='text-muted-foreground flex flex-col items-center space-y-4 p-4'>
										<Icons.arrowRight className='h-12 w-12' />
										<div className='text-center'>
											<p className='text-lg font-medium'>Error al cargar la imagen</p>
											<p className='text-sm'>La imagen no pudo ser cargada</p>
										</div>
									</div>
								) : (
									<Image
										src={categoryData.photo.path}
										alt={`Imagen de ${categoryData.name}`}
										fill
										className={`object-contain transition-all duration-700 ${
											imageLoaded ? 'opacity-100' : 'opacity-0'
										}`}
										unoptimized
										onLoad={handleImageLoad}
										onError={handleImageError}
										onContextMenu={e => e.preventDefault()}
									/>
								)}
							</div>

							{/* Panel lateral de información - Reorganizado para móviles */}
							<div className='flex w-full flex-col border-t md:w-80 md:border-t-0 md:border-l lg:w-96'>
								<Card className='flex h-full flex-col rounded-t-none border-none md:rounded-t-lg md:rounded-l-none md:rounded-br-lg'>
									<CardHeader>
										<CardTitle>Detalles</CardTitle>
										<CardDescription>Información detallada sobre la imagen.</CardDescription>
									</CardHeader>

									<CardContent className='flex-1 overflow-y-auto'>
										<div className='space-y-6'>
											{/* Acciones mejoradas */}
											<div className='space-y-4'>
												<div className='flex flex-wrap gap-3'>
													<ActionButton
														icon={isDownloading ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
														onClick={handleDownload}
														disabled={isDownloading || imageError}
														variant='secondary'
														text={isDownloading ? 'Descargando...' : 'Descargar'}
														className='min-w-[120px] flex-1'
													/>

													<ActionButton
														icon={<Icons.copy />}
														onClick={handleShare}
														variant='secondary'
														text='Copiar enlace'
														className='min-w-[120px] flex-1'
													/>
												</div>
											</div>

											<Separator />

											{/* Información técnica mejorada */}
											<div className='space-y-4'>
												<h4 className='text-foreground text-base font-semibold'>Información</h4>
												<div className='space-y-3'>
													<div className='flex items-center justify-between'>
														<span className='text-muted-foreground text-sm'>Formato:</span>
														<span className='text-sm font-medium'>{categoryData.photo.path.split('.').pop()}</span>
													</div>

													<div className='flex items-center justify-between'>
														<span className='text-muted-foreground text-sm'>Tamaño:</span>
														<span className='text-sm font-medium'>5 mb</span>
													</div>

													<div className='flex items-center justify-between'>
														<span className='text-muted-foreground text-sm'>Creado:</span>
														<span className='text-sm font-medium'>{formatDate(categoryData.createdAt, true)}</span>
													</div>
												</div>
											</div>
										</div>
									</CardContent>

									{/* Atajos de teclado movidos al footer */}
									<CardFooter className='flex flex-col px-4'>
										<Separator />
										<div className='w-full space-y-2 pt-6'>
											<div className='text-muted-foreground flex justify-between text-xs'>
												<div className='flex items-center gap-2'>
													<kbd className='bg-muted rounded px-2 py-1'>ESC</kbd>
													<span>Cerrar</span>
												</div>

												<div className='flex items-center gap-2'>
													<kbd className='bg-muted rounded px-2 py-1'>D</kbd>
													<span>Descargar</span>
												</div>

												<div className='flex items-center gap-2'>
													<kbd className='bg-muted rounded px-2 py-1'>S</kbd>
													<span>Compartir</span>
												</div>
											</div>
										</div>
									</CardFooter>
								</Card>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		)
	}

	// Placeholder mejorado cuando no hay imagen
	return (
		<Card className='group bg-muted/20 border-border/50 relative h-16 w-28 overflow-hidden border border-dashed'>
			<CardContent className='p-0'>
				<div className='text-muted-foreground absolute inset-0 flex flex-col items-center justify-center space-y-1'>
					<Icons.media className='h-10 w-10' />
				</div>
			</CardContent>
		</Card>
	)
}
