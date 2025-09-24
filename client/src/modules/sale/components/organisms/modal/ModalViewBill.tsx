'use client'

import api from '@/lib/axios'
import { Icons } from '@/components/icons'
import { useCallback, useState, useEffect } from 'react'
import { I_Sale } from '@/common/types/modules/sale'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { generateSaleReceiptPDF } from '@/modules/pos/matriz/hooks/generateSaleReceiptPDF'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { SaleToTicket } from '@/modules/pos/matriz/types/ticket'
import { Typography } from '@/components/ui/typography'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { formatDate } from '@/common/utils/dateFormater-util'
import { StatusSRIBadge } from '../../atoms/StatusSRIBadge'
import { Badge } from '@/components/layout/atoms/Badge'
import { UtilBanner } from '@/components/UtilBanner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ModalViewBillProps {
	isOpen: boolean
	recordData: I_Sale | null
	onClose: () => void
}

export function ModalViewBill({ isOpen, recordData, onClose }: ModalViewBillProps) {
	const [pdfUrl, setPdfUrl] = useState<string>('')
	const [voucherPdfUrl, setVoucherPdfUrl] = useState<string>('')
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)
	const [isLoadingVoucher, setIsLoadingVoucher] = useState(false)
	const [isDownloading, setIsDownloading] = useState<{ pdf: boolean; xml: boolean; ticket: boolean }>({
		pdf: false,
		xml: false,
		ticket: false,
	})

	// Verificar si es documento electrónico
	const isElectronic = recordData?.estado_sri !== 'NO_ELECTRONIC'

	// Cleanup de los blob URLs cuando el componente se desmonte
	useEffect(() => {
		return () => {
			if (pdfUrl) window.URL.revokeObjectURL(pdfUrl)
			if (voucherPdfUrl) window.URL.revokeObjectURL(voucherPdfUrl)
		}
	}, [pdfUrl, voucherPdfUrl])

	// Cargar PDF cuando se abre el modal (solo para documentos electrónicos)
	useEffect(() => {
		if (isOpen && recordData) {
			if (recordData.clave_acceso && isElectronic) {
				loadPDFPreview()
			}
			// Siempre cargar el voucher si está disponible
			if (recordData.pdfVoucher) {
				loadVoucherPDF()
			}
		} else {
			// Limpiar cuando se cierra
			if (pdfUrl) {
				window.URL.revokeObjectURL(pdfUrl)
				setPdfUrl('')
			}
			if (voucherPdfUrl) {
				window.URL.revokeObjectURL(voucherPdfUrl)
				setVoucherPdfUrl('')
			}
		}
	}, [isOpen, recordData?.clave_acceso, recordData?.pdfVoucher, isElectronic])

	const loadPDFPreview = useCallback(async () => {
		if (!recordData?.clave_acceso || !isElectronic) return

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
		} finally {
			setIsLoadingPreview(false)
		}
	}, [recordData?.clave_acceso, pdfUrl, isElectronic])

	const loadVoucherPDF = useCallback(async () => {
		if (!recordData?.pdfVoucher) return

		setIsLoadingVoucher(true)
		try {
			// Limpiar URL anterior si existe
			if (voucherPdfUrl) {
				window.URL.revokeObjectURL(voucherPdfUrl)
			}

			// Convertir base64 a blob
			const base64Response = await fetch(`data:application/pdf;base64,${recordData.pdfVoucher}`)
			const blob = await base64Response.blob()

			// Crear URL del blob para mostrar en el iframe
			const url = window.URL.createObjectURL(blob)
			setVoucherPdfUrl(url)
		} catch (error) {
			console.error('Error al cargar el voucher PDF:', error)
		} finally {
			setIsLoadingVoucher(false)
		}
	}, [recordData?.pdfVoucher, voucherPdfUrl])

	const handleClose = useCallback(() => {
		// Limpiar URLs de los blobs antes de cerrar
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl)
			setPdfUrl('')
		}
		if (voucherPdfUrl) {
			window.URL.revokeObjectURL(voucherPdfUrl)
			setVoucherPdfUrl('')
		}
		// Cerrar el diálogo
		onClose()
		setIsLoadingPreview(false)
		setIsLoadingVoucher(false)
	}, [pdfUrl, voucherPdfUrl, onClose])

	// Función para imprimir el PDF corregida
	const handlePrintPDF = useCallback(
		(type: 'factura' | 'voucher') => {
			const url = type === 'factura' ? pdfUrl : voucherPdfUrl
			if (!url) return

			// Abrir en nueva ventana e imprimir
			const printWindow = window.open(url, '_blank')
			if (printWindow) {
				// Esperar a que el PDF se cargue en la nueva ventana
				printWindow.onload = () => {
					setTimeout(() => {
						printWindow.print()
					}, 500)
				}
			}
		},
		[pdfUrl, voucherPdfUrl]
	)

	const downloadFile = async (type: 'pdf' | 'xml', endpoint: string, mimeType: string, extension: string) => {
		if (!recordData?.clave_acceso || !isElectronic) return

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
			link.setAttribute('aria-label', `Descargar archivo ${type.toUpperCase()}`)
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
		if (recordData?.clave_acceso && !isDownloading.pdf && isElectronic) {
			await downloadFile('pdf', `${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/pdf`, 'application/pdf', 'pdf')
		}
	}, [recordData?.clave_acceso, isDownloading.pdf, isElectronic])

	const handleDownloadXML = useCallback(async () => {
		if (recordData?.clave_acceso && !isDownloading.xml && isElectronic) {
			await downloadFile('xml', `${ENDPOINT_API.BILLING}/${recordData.clave_acceso}/xml`, 'application/xml', 'xml')
		}
	}, [recordData?.clave_acceso, isDownloading.xml, isElectronic])

	// Función para descargar el voucher PDF
	const handleDownloadVoucher = useCallback(async () => {
		if (!recordData?.pdfVoucher) return

		try {
			// Convertir base64 a blob y descargar
			const base64Response = await fetch(`data:application/pdf;base64,${recordData.pdfVoucher}`)
			const blob = await base64Response.blob()
			const url = window.URL.createObjectURL(blob)

			const link = document.createElement('a')
			link.href = url
			link.download = `voucher_${recordData.id || 'documento'}.pdf`
			link.setAttribute('aria-label', 'Descargar voucher PDF')
			document.body.appendChild(link)
			link.click()

			// Limpiar
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Error al descargar voucher:', error)
		}
	}, [recordData?.pdfVoucher, recordData?.id])

	// Renderizar botones de impresión con dropdown
	const renderPrintButtons = () => {
		const hasFactura = isElectronic && pdfUrl
		const hasVoucher = recordData?.pdfVoucher && voucherPdfUrl

		if (!hasFactura && !hasVoucher) return null

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='sm' className='flex items-center gap-2'>
						<Icons.printer className='h-4 w-4' />
						Imprimir
						<Icons.chevronDown className='h-3 w-3' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					{hasFactura && (
						<DropdownMenuItem onClick={() => handlePrintPDF('factura')} disabled={isLoadingPreview}>
							<Icons.fileText className='h-4 w-4' />
							<span>Factura</span>
						</DropdownMenuItem>
					)}
					{hasVoucher && (
						<DropdownMenuItem onClick={() => handlePrintPDF('voucher')} disabled={isLoadingVoucher}>
							<Icons.ticket className='h-4 w-4' />
							<span>Voucher</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		)
	}

	// Renderizar botones de descarga simplificados
	const renderDownloadButtons = () => {
		const hasFactura = isElectronic && recordData?.clave_acceso
		const hasVoucher = recordData?.pdfVoucher

		if (!hasFactura && !hasVoucher) return null

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='sm' className='flex items-center gap-2'>
						<Icons.download className='h-4 w-4' />
						Descargar
						<Icons.chevronDown className='h-3 w-3' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					{hasFactura && (
						<>
							<DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading.pdf}>
								<Icons.fileText className='h-4 w-4' />
								<span>{isDownloading.pdf ? 'Descargando...' : 'Factura PDF'}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleDownloadXML} disabled={isDownloading.xml}>
								<Icons.barCode className='h-4 w-4' />
								<span>{isDownloading.xml ? 'Descargando...' : 'Archivo XML'}</span>
							</DropdownMenuItem>
						</>
					)}
					{hasVoucher && (
						<DropdownMenuItem onClick={handleDownloadVoucher}>
							<Icons.ticket className='h-4 w-4' />
							<span>Voucher PDF</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		)
	}

	// Renderizar botones específicos mejorados
	const renderActionButtons = () => {
		return (
			<div className='flex w-full flex-col items-center justify-end gap-4 sm:flex-row'>
				<div className='flex flex-wrap items-center justify-center gap-2'>
					{/* Botón de impresión con dropdown */}
					{renderPrintButtons()}

					{/* Botón de descarga con dropdown */}
					{renderDownloadButtons()}
				</div>
			</div>
		)
	}

	if (!recordData) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='flex h-full min-w-full flex-col rounded-none' aria-describedby='voucher-description'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div className='flex w-full flex-col space-y-2'>
							<DialogTitle>
								{isElectronic ? 'Factura/' : ''}Voucher de la venta #{recordData.code}
							</DialogTitle>
							<DialogDescription id='voucher-description' className='text-sm'>
								<div className='space-y-1 text-center'>
									<div className='flex flex-col gap-2 sm:flex-row'>
										<Badge
											variant='info'
											text={formatPrice(recordData.total)}
											icon={<Icons.moneyBag className='h-4 w-4' />}
										/>

										<Badge
											variant='secondary'
											text={formatDate(recordData.createdAt, true)}
											icon={<Icons.calendar className='h-4 w-4' />}
										/>
									</div>
								</div>
							</DialogDescription>
						</div>
						<DialogClose asChild>
							<ActionButton
								icon={<Icons.x />}
								size='icon'
								variant='secondary'
								onClick={handleClose}
								aria-label='Cerrar modal'
								className='absolute top-4 right-4'
							/>
						</DialogClose>
					</div>
				</DialogHeader>

				<div className='flex-1 gap-6 sm:flex sm:min-h-[81vh]'>
					{/* Columna izquierda - Factura electrónica */}
					<div className='flex flex-1 flex-col'>
						{isElectronic ? (
							<>
								<div className='bg-muted flex-1 overflow-hidden rounded-xl'>
									{isLoadingPreview ? (
										<div className='flex h-full items-center justify-center'>
											<SpinnerLoader text='Cargando factura...' inline />
										</div>
									) : pdfUrl ? (
										<iframe
											src={pdfUrl}
											className='h-full w-full rounded-xl border'
											title='Factura Electrónica PDF'
											sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
										/>
									) : (
										<div className='flex h-full items-center justify-center'>
											<UtilBanner icon={<Icons.fileText />} description='No se pudo cargar la factura electrónica' />
										</div>
									)}
								</div>
							</>
						) : (
							<div className='bg-muted flex h-full items-center justify-center rounded-xl'>
								<UtilBanner icon={<Icons.fileText />} description='No aplica factura electrónica' />
							</div>
						)}
						<div className='text-muted-foreground mt-2 text-center text-sm'>
							Factura Electrónica {recordData.clave_acceso}
						</div>
					</div>

					{/* Columna derecha - Voucher/Ticket */}
					<div className={`flex flex-1 flex-col ${!isElectronic ? 'col-span-2' : ''}`}>
						<div className='bg-muted flex-1 overflow-hidden rounded-xl'>
							{isLoadingVoucher ? (
								<div className='flex h-full items-center justify-center'>
									<SpinnerLoader text='Cargando voucher...' inline />
								</div>
							) : voucherPdfUrl ? (
								<iframe
									src={voucherPdfUrl}
									className='h-full w-full rounded-xl border'
									title='Voucher PDF'
									sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
								/>
							) : recordData.pdfVoucher ? (
								<div className='flex h-full items-center justify-center'>
									<UtilBanner icon={<Icons.ticket />} description='No se pudo cargar el voucher' />
								</div>
							) : (
								<div className='flex h-full items-center justify-center'>
									<UtilBanner icon={<Icons.ticket />} description='Voucher no disponible' />
								</div>
							)}
						</div>
						<div className='text-muted-foreground mt-2 text-center text-sm'>Voucher</div>
					</div>
				</div>

				<DialogFooter className='flex flex-col items-end gap-2 sm:flex-col'>{renderActionButtons()}</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
