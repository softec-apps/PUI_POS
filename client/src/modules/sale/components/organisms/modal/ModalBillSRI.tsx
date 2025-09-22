'use client'

import api from '@/lib/axios'
import { Icons } from '@/components/icons'
import { useCallback, useState, useEffect } from 'react'
import { I_Sale } from '@/common/types/modules/sale'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface ModalBillSRIProps {
	isOpen: boolean
	recordData: I_Sale | null
	onClose: () => void
}

export function ModalBillSRI({ isOpen, recordData, onClose }: ModalBillSRIProps) {
	const [pdfUrl, setPdfUrl] = useState<string>('')
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)
	const [isDownloading, setIsDownloading] = useState<{ pdf: boolean; xml: boolean }>({
		pdf: false,
		xml: false,
	})

	// Cleanup del blob URL cuando el componente se desmonte o cambie el PDF
	useEffect(() => {
		return () => {
			if (pdfUrl) window.URL.revokeObjectURL(pdfUrl)
		}
	}, [pdfUrl])

	// Cargar PDF cuando se abre el modal
	useEffect(() => {
		if (isOpen && recordData?.clave_acceso) {
			loadPDFPreview()
		} else {
			// Limpiar cuando se cierra
			if (pdfUrl) {
				window.URL.revokeObjectURL(pdfUrl)
				setPdfUrl('')
			}
		}
	}, [isOpen, recordData?.clave_acceso])

	const loadPDFPreview = useCallback(async () => {
		if (!recordData?.clave_acceso) return

		setIsLoadingPreview(true)

		try {
			const response = await api.get(`${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/pdf`, {
				responseType: 'blob',
			})

			// Limpiar URL anterior si existe
			if (pdfUrl) {
				window.URL.revokeObjectURL(pdfUrl)
			}

			// Crear URL del blob para mostrar en el iframe
			const blob = new Blob([response.data], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			setPdfUrl(url)
		} catch (error) {
			console.error('Error al cargar la previa del PDF:', error)
			onClose()
		} finally {
			setIsLoadingPreview(false)
		}
	}, [recordData?.clave_acceso, pdfUrl, onClose])

	const handleClose = useCallback(() => {
		// Limpiar URL del blob antes de cerrar
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl)
			setPdfUrl('')
		}

		// Cerrar el diálogo
		onClose()
		setIsLoadingPreview(false)
	}, [pdfUrl, onClose])

	// Función para imprimir el PDF
	const handlePrintPDF = useCallback(() => {
		if (!pdfUrl) return

		// Crear un iframe oculto para imprimir
		const iframe = document.createElement('iframe')
		iframe.style.display = 'none'
		iframe.style.position = 'absolute'
		iframe.style.left = '-9999px'
		iframe.src = pdfUrl

		// Cuando el iframe esté cargado, imprimir
		iframe.onload = () => {
			try {
				iframe.contentWindow?.focus()
				iframe.contentWindow?.print()

				// Remover el iframe después de un tiempo
				setTimeout(() => {
					if (document.body.contains(iframe)) {
						document.body.removeChild(iframe)
					}
				}, 1000)
			} catch (error) {
				console.error('Error al imprimir:', error)
				// Fallback: abrir en nueva ventana e imprimir
				const printWindow = window.open(pdfUrl, '_blank')
				if (printWindow) {
					printWindow.onload = () => {
						printWindow.print()
					}
				}
				// Remover iframe en caso de error
				if (document.body.contains(iframe)) {
					document.body.removeChild(iframe)
				}
			}
		}

		// Manejar errores de carga
		iframe.onerror = () => {
			console.error('Error al cargar iframe para imprimir')
			if (document.body.contains(iframe)) {
				document.body.removeChild(iframe)
			}
		}

		document.body.appendChild(iframe)
	}, [pdfUrl])

	const downloadFile = async (type: 'pdf' | 'xml', endpoint: string, mimeType: string, extension: string) => {
		if (!recordData?.clave_acceso) return

		setIsDownloading(prev => ({ ...prev, [type]: true }))

		try {
			const response = await api.get(endpoint, {
				responseType: 'blob',
			})

			// Crear un blob URL y descargar el archivo
			const blob = new Blob([response.data], { type: mimeType })
			const url = window.URL.createObjectURL(blob)

			// Obtener el nombre del archivo desde los headers (si está disponible)
			const contentDisposition = response.headers['content-disposition']
			const fileName = contentDisposition
				? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
				: `documento_${recordData.clave_acceso}.${extension}`

			// Crear elemento temporal para descargar
			const link = document.createElement('a')
			link.href = url
			link.download = fileName
			document.body.appendChild(link)
			link.click()

			// Limpiar inmediatamente después de la descarga
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		} catch (error) {
			console.error(`Error al descargar ${type.toUpperCase()}:`, error)
		} finally {
			setIsDownloading(prev => ({ ...prev, [type]: false }))
		}
	}

	const handleDownloadPDF = useCallback(async () => {
		if (recordData?.clave_acceso && !isDownloading.pdf) {
			await downloadFile('pdf', `${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/pdf`, 'application/pdf', 'pdf')
		}
	}, [recordData?.clave_acceso, isDownloading.pdf])

	const handleDownloadXML = useCallback(async () => {
		if (recordData?.clave_acceso && !isDownloading.xml) {
			await downloadFile('xml', `${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/xml`, 'application/xml', 'xml')
		}
	}, [recordData?.clave_acceso, isDownloading.xml])

	if (!recordData) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='flex h-[95vh] min-w-5xl flex-col'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<DialogTitle>Previa de Factura</DialogTitle>
						<DialogClose asChild>
							<ActionButton icon={<Icons.x />} size='icon' variant='secondary' onClick={handleClose} />
						</DialogClose>
					</div>
					<DialogDescription>Clave de acceso: {recordData.clave_acceso}</DialogDescription>
				</DialogHeader>

				<div className='flex flex-1 flex-col gap-4'>
					{/* Previa del PDF */}
					<div className='flex-1 overflow-hidden'>
						{isLoadingPreview ? (
							<div className='flex h-full items-center justify-center'>
								<SpinnerLoader text='Cargando...Por favor espera' />
							</div>
						) : pdfUrl ? (
							<iframe
								src={pdfUrl}
								className='h-full w-full border'
								title='Previa de Factura'
								sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
							/>
						) : (
							<div className='flex h-full items-center justify-center'>
								<div className='flex flex-col items-center gap-2'>
									<Icons.fileText className='text-muted-foreground h-8 w-8' />
									<p className='text-muted-foreground text-sm'>No se pudo cargar la previa</p>
								</div>
							</div>
						)}
					</div>

					{/* Botones de acción */}
					<div className='flex items-center justify-between gap-2 pt-2'>
						<div className='flex items-center gap-2'>
							<ActionButton
								size='sm'
								variant='ghost'
								onClick={() => window.open(pdfUrl, '_blank')}
								disabled={!pdfUrl || isLoadingPreview}
								icon={<Icons.link />}
								text='Abrir en nueva pestaña'
							/>
							<ActionButton
								size='sm'
								variant='ghost'
								onClick={handlePrintPDF}
								disabled={!pdfUrl || isLoadingPreview}
								icon={<Icons.printer />}
								text='Imprimir'
							/>
						</div>

						<div className='flex items-center gap-4'>
							<ActionButton
								size='sm'
								variant='secondary'
								onClick={handleDownloadXML}
								disabled={isDownloading.xml}
								icon={isDownloading.xml ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
								text={isDownloading.xml ? 'Descargando...' : 'Descargar XML'}
							/>

							<ActionButton
								size='sm'
								onClick={handleDownloadPDF}
								disabled={isDownloading.pdf}
								icon={isDownloading.pdf ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
								text={isDownloading.pdf ? 'Descargando...' : 'Descargar PDF'}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
