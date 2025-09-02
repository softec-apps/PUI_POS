'use client'

import api from '@/lib/axios'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { I_Sale } from '@/common/types/modules/sale'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface ActionsProps {
	recordData: I_Sale
}

export const Actions = ({ recordData }: ActionsProps) => {
	const router = useRouter()
	const [isDownloading, setIsDownloading] = useState<{ pdf: boolean; xml: boolean }>({
		pdf: false,
		xml: false,
	})
	const [showPreviewDialog, setShowPreviewDialog] = useState(false)
	const [pdfUrl, setPdfUrl] = useState<string>('')
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)

	const handleViewDetails = useCallback(() => {
		router.push(`${ROUTE_PATH.ADMIN.SALES}/${recordData.id}`)
	}, [router, recordData.id])

	const downloadFile = async (type: 'pdf' | 'xml', endpoint: string, mimeType: string, extension: string) => {
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

			// Limpiar
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		} catch (error) {
			console.error(`Error al descargar ${type.toUpperCase()}:`, error)
		} finally {
			setIsDownloading(prev => ({ ...prev, [type]: false }))
		}
	}

	const handleDownloadPDF = useCallback(async () => {
		if (recordData.clave_acceso && !isDownloading.pdf) {
			await downloadFile('pdf', `${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/pdf`, 'application/pdf', 'pdf')
		}
	}, [recordData.clave_acceso, isDownloading.pdf])

	const handleDownloadXML = useCallback(async () => {
		if (recordData.clave_acceso && !isDownloading.xml) {
			await downloadFile('xml', `${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/xml`, 'application/xml', 'xml')
		}
	}, [recordData.clave_acceso, isDownloading.xml])

	const handleViewInvoice = useCallback(async () => {
		if (!recordData.clave_acceso) return

		setIsLoadingPreview(true)
		setShowPreviewDialog(true)

		try {
			const response = await api.get(`${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/pdf`, {
				responseType: 'blob',
			})

			// Crear URL del blob para mostrar en el iframe
			const blob = new Blob([response.data], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			setPdfUrl(url)
		} catch (error) {
			console.error('Error al cargar la previa del PDF:', error)
			setShowPreviewDialog(false)
		} finally {
			setIsLoadingPreview(false)
		}
	}, [recordData.clave_acceso])

	const handleViewComprobante = useCallback(() => {
		if (recordData.clave_acceso) {
			window.open(`https://www.sri.gob.ec/comprobantes/${recordData.clave_acceso}`, '_blank')
		}
	}, [recordData.clave_acceso])

	const handleClosePreview = useCallback(() => {
		setShowPreviewDialog(false)
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl)
			setPdfUrl('')
		}
	}, [pdfUrl])

	// Función para imprimir el PDF
	const handlePrintPDF = useCallback(() => {
		if (!pdfUrl) return

		// Crear un iframe oculto para imprimir
		const iframe = document.createElement('iframe')
		iframe.style.display = 'none'
		iframe.src = pdfUrl

		// Cuando el iframe esté cargado, imprimir
		iframe.onload = () => {
			try {
				iframe.contentWindow?.focus()
				iframe.contentWindow?.print()
			} catch (error) {
				console.error('Error al imprimir:', error)
				// Fallback: abrir en nueva ventana e imprimir
				const printWindow = window.open(pdfUrl, '_blank')
				if (printWindow) {
					printWindow.onload = () => {
						printWindow.print()
					}
				}
			}
		}

		document.body.appendChild(iframe)
	}, [pdfUrl])

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<ActionButton
						icon={<Icons.dotsVertical />}
						variant='ghost'
						tooltip='Ver Acciones'
						size='icon'
						className='rounded-full'
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='border-border/50 rounded-2xl border'>
					<DropdownMenuItem onClick={handleViewDetails} className='flex items-center gap-2 rounded-xl'>
						<Icons.eye />
						<span>Detalles venta</span>
					</DropdownMenuItem>
					{recordData.clave_acceso ? (
						<>
							<DropdownMenuItem onClick={handleViewInvoice} className='flex items-center gap-2 rounded-xl'>
								<Icons.file />
								<span>Visualizar factura</span>
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={handleDownloadPDF}
								className='flex items-center gap-2 rounded-xl'
								disabled={isDownloading.pdf}>
								{isDownloading.pdf ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
								<span>Descargar PDF</span>
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={handleDownloadXML}
								className='flex items-center gap-2 rounded-xl'
								disabled={isDownloading.xml}>
								{isDownloading.xml ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
								<span>Descargar XML</span>
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem onClick={handleViewComprobante} className='flex items-center gap-2 rounded-xl'>
							<Icons.fileText />
							<span>Ver Comprobante</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialog para previa de PDF */}
			<Dialog open={showPreviewDialog} onOpenChange={handleClosePreview}>
				<DialogContent className='flex h-[95vh] min-w-5xl flex-col'>
					<DialogHeader>
						<div className='flex items-center justify-between'>
							<DialogTitle>Previa de Factura</DialogTitle>
							<DialogClose>
								<ActionButton icon={<Icons.x />} size='icon' variant='secondary' />
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
								<iframe src={pdfUrl} className='h-full w-full' title='Previa de Factura' />
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
									onClick={handleDownloadPDF}
									disabled={isDownloading.pdf}
									icon={isDownloading.pdf ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
									text={isDownloading.pdf ? 'Descargando...' : 'Descargar PDF'}
								/>

								<ActionButton
									size='sm'
									variant='secondary'
									onClick={handleDownloadXML}
									disabled={isDownloading.xml}
									icon={isDownloading.xml ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
									text={isDownloading.xml ? 'Descargando...' : 'Descargar XML'}
								/>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
