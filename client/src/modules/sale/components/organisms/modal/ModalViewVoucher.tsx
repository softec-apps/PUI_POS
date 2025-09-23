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
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { SaleToTicket } from '@/modules/pos/matriz/types/ticket'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { formatDate } from '@/common/utils/dateFormater-util'

interface ModalViewVoucherProps {
	isOpen: boolean
	recordData: I_Sale | null
	onClose: () => void
}

export function ModalViewVoucher({ isOpen, recordData, onClose }: ModalViewVoucherProps) {
	const [pdfUrl, setPdfUrl] = useState<string>('')
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)
	const [activeTab, setActiveTab] = useState<'pdf' | 'ticket'>('pdf')
	const [isDownloading, setIsDownloading] = useState<{ pdf: boolean; xml: boolean; ticket: boolean }>({
		pdf: false,
		xml: false,
		ticket: false,
	})

	// Verificar si es documento electrónico
	const isElectronic = recordData?.estado_sri !== 'NO_ELECTRONIC'

	// Cleanup del blob URL cuando el componente se desmonte o cambie el PDF
	useEffect(() => {
		return () => {
			if (pdfUrl) window.URL.revokeObjectURL(pdfUrl)
		}
	}, [pdfUrl])

	// Cargar PDF cuando se abre el modal (solo para documentos electrónicos)
	useEffect(() => {
		if (isOpen && recordData?.clave_acceso && isElectronic) {
			loadPDFPreview()
		} else {
			// Limpiar cuando se cierra
			if (pdfUrl) {
				window.URL.revokeObjectURL(pdfUrl)
				setPdfUrl('')
			}
		}
	}, [isOpen, recordData?.clave_acceso, isElectronic])

	// Establecer tab inicial basado en tipo de documento
	useEffect(() => {
		if (isOpen) {
			setActiveTab(isElectronic ? 'pdf' : 'ticket')
		}
	}, [isOpen, isElectronic])

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
			onClose()
		} finally {
			setIsLoadingPreview(false)
		}
	}, [recordData?.clave_acceso, pdfUrl, onClose, isElectronic])

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

	// Nueva función para generar ticket PDF
	const handleGenerateTicket = useCallback(async () => {
		if (!recordData) return

		setIsDownloading(prev => ({ ...prev, ticket: true }))
		try {
			// Transformar los datos del voucher al formato esperado por la función
			const ticketData: SaleToTicket = {
				id: recordData.id,
				claveAcceso: recordData.clave_acceso,
				createdAt: recordData.createdAt,
				subtotal: recordData.subtotal,
				discountAmount: parseFloat(recordData.discountAmount),
				taxAmount: recordData.taxAmount,
				total: recordData.total,
				change: recordData.change,
				customer: recordData.customer
					? {
							firstName: recordData.customer.firstName,
							lastName: recordData.customer.lastName,
							identificationNumber: recordData.customer.identificationNumber,
							email: recordData.customer.email,
						}
					: undefined,
				items: recordData.items?.map(item => ({
					productName: item.productName,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
				})),
				paymentMethods: recordData.paymentMethods?.map(pm => ({
					method: pm.method,
					amount: pm.amount,
				})),
				establishment: {
					companyName: 'EMPRESA MEDICA S.A.',
					tradeName: 'CENTRO MÉDICO',
					ruc: '1791764066001',
					parentEstablishmentAddress: 'Av. Principal 123, Guayaquil',
				},
				facturaInfo: recordData.clave_acceso
					? {
							claveAcceso: recordData.clave_acceso,
						}
					: undefined,
			}

			// Generar el PDF del ticket
			generateSaleReceiptPDF(ticketData)
		} catch (error) {
			console.error('Error al generar ticket:', error)
		} finally {
			setIsDownloading(prev => ({ ...prev, ticket: false }))
		}
	}, [recordData])

	const PaymentMethodLabels: Record<string, string> = {
		cash: 'Efectivo',
		credit: 'Crédito',
		debit: 'Débito',
		transfer: 'Transferencia',
		check: 'Cheque',
		credit_card: 'Tarjeta de crédito',
		digital: 'Pago digital',
		card: 'Tarjeta',
	}

	const renderTicketPreview = () => (
		<div className='w-full max-w-sm rounded-lg border bg-white p-6 font-mono text-xs shadow-lg'>
			{/* Header */}
			<div className='mb-4 text-center'>
				<div className='text-sm font-bold'>EMPRESA MEDICA S.A.</div>
				<div className='text-xs'>CENTRO MÉDICO</div>
				<div className='text-xs'>RUC: 1791764066001</div>
				<div className='text-xs'>Av. Principal 123, Guayaquil</div>
			</div>

			{/* Clave de acceso - solo si es documento electrónico */}
			{recordData?.clave_acceso && isElectronic && (
				<div className='mb-4 text-center'>
					<div className='text-xs font-semibold'>CLAVE DE ACCESO:</div>
					<div className='text-xs leading-tight break-all'>{recordData.clave_acceso}</div>
				</div>
			)}

			{/* Info venta */}
			<div className='mb-4 text-xs'>
				<div>
					{isElectronic ? 'Factura' : 'Comprobante'}: {recordData?.id?.split('-').pop()}
				</div>
				<div>Fecha: {formatDate(recordData?.createdAt || new Date())}</div>
				<div className='break-words'>
					Cliente: {recordData?.customer?.firstName || 'Consumidor Final'} {recordData?.customer?.lastName || ''}
				</div>
				<div>CI/RUC: {recordData?.customer?.identificationNumber || '9999999999'}</div>
				{recordData?.customer?.email && <div className='break-all'>Email: {recordData.customer.email}</div>}
			</div>

			<div className='my-2 border-t border-dashed border-gray-400'></div>

			{/* Header productos */}
			<div className='mb-2 grid grid-cols-12 gap-1 text-xs font-semibold'>
				<span className='col-span-6'>DESCRIPCIÓN</span>
				<span className='col-span-2 text-center'>CNT</span>
				<span className='col-span-2 text-right'>P.U</span>
				<span className='col-span-2 text-right'>TOTAL</span>
			</div>

			{/* Items */}
			<div className='mb-4 text-xs'>
				{recordData?.items?.map((item, index) => (
					<div key={index} className='mb-2'>
						<div className='truncate text-xs leading-tight'>{item.productName}</div>
						<div className='grid grid-cols-12 gap-1'>
							<span className='col-span-6'></span>
							<span className='col-span-2 text-center'>{item.quantity}</span>
							<span className='col-span-2 text-right'>{formatPrice(item.unitPrice)}</span>
							<span className='col-span-2 text-right'>{formatPrice(item.unitPrice * item.quantity)}</span>
						</div>
					</div>
				))}
			</div>

			<div className='my-2 border-t border-dashed border-gray-400'></div>

			{/* Totales */}
			<div className='mb-4 space-y-1 text-xs'>
				<div className='flex justify-between'>
					<span>Subtotal:</span>
					<span>{formatPrice(recordData?.subtotal || 0)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Impuestos:</span>
					<span>{formatPrice(recordData?.taxAmount || 0)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Descuento:</span>
					<span>{formatPrice(parseFloat(recordData?.discountAmount || '0'))}</span>
				</div>
				<div className='flex justify-between border-t pt-1 text-sm font-bold'>
					<span>TOTAL:</span>
					<span>{formatPrice(recordData?.total || 0)}</span>
				</div>
			</div>

			<div className='my-2 border-t border-dashed border-gray-400'></div>

			{/* Métodos de pago */}
			{recordData?.paymentMethods && (
				<div className='mb-4 space-y-1 text-xs'>
					<div className='mb-1 font-semibold'>FORMA DE PAGO</div>
					{recordData.paymentMethods.map((pm, index) => (
						<div key={index} className='flex justify-between'>
							<span className='truncate pr-2'>{PaymentMethodLabels[pm.method] || pm.method}:</span>
							<span className='flex-shrink-0'>{formatPrice(pm.amount)}</span>
						</div>
					))}
					<div className='flex justify-between'>
						<span>Cambio:</span>
						<span>{formatPrice(recordData.change || 0)}</span>
					</div>
				</div>
			)}

			{/* Footer */}
			<div className='mt-4 text-center text-xs'>
				<div className='font-bold'>*** GRACIAS POR SU COMPRA ***</div>
				{recordData?.clave_acceso && isElectronic && (
					<>
						<div className='mt-2'>Consulte sus comprobantes en:</div>
						<div>www.sri.gob.ec</div>
					</>
				)}
			</div>
		</div>
	)

	// Renderizar botones específicos por vista
	const renderActionButtons = () => {
		if (activeTab === 'pdf' && isElectronic) {
			return (
				<>
					<div className='flex items-center gap-2'>
						<ActionButton
							size='sm'
							variant='ghost'
							onClick={() => window.open(pdfUrl, '_blank')}
							disabled={!pdfUrl || isLoadingPreview}
							icon={<Icons.link />}
							text='Abrir en nueva pestaña'
							aria-label='Abrir PDF en nueva pestaña'
						/>
						<ActionButton
							size='sm'
							variant='ghost'
							onClick={handlePrintPDF}
							disabled={!pdfUrl || isLoadingPreview}
							icon={<Icons.printer />}
							text='Imprimir PDF'
							aria-label='Imprimir documento PDF'
						/>
					</div>
					<div className='flex items-center gap-2'>
						<ActionButton
							size='sm'
							variant='secondary'
							onClick={handleDownloadXML}
							disabled={isDownloading.xml}
							icon={isDownloading.xml ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.barCode />}
							text={isDownloading.xml ? 'Descargando...' : 'Descargar XML'}
							aria-label='Descargar archivo XML'
						/>
						<ActionButton
							size='sm'
							onClick={handleDownloadPDF}
							disabled={isDownloading.pdf}
							icon={isDownloading.pdf ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.download />}
							text={isDownloading.pdf ? 'Descargando...' : 'Descargar PDF'}
							aria-label='Descargar archivo PDF'
						/>
					</div>
				</>
			)
		}

		// Botones para vista de ticket
		return (
			<>
				<div className='flex items-center gap-2'>
					<ActionButton
						size='sm'
						variant='ghost'
						onClick={handleGenerateTicket}
						disabled={isDownloading.ticket}
						icon={isDownloading.ticket ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.printer />}
						text={isDownloading.ticket ? 'Generando...' : 'Imprimir Ticket'}
						aria-label='Imprimir ticket de venta'
					/>
				</div>
				<div className='flex items-center gap-2'>
					<ActionButton
						size='sm'
						onClick={handleGenerateTicket}
						disabled={isDownloading.ticket}
						icon={isDownloading.ticket ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.receipt />}
						text={isDownloading.ticket ? 'Generando...' : 'Descargar Ticket'}
						aria-label='Descargar ticket PDF'
					/>
				</div>
			</>
		)
	}

	if (!recordData) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='flex h-[95vh] min-w-6xl flex-col' aria-describedby='voucher-description'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div className='flex flex-col space-y-1'>
							<DialogTitle className='flex items-center gap-3'>
								{isElectronic ? 'Vista de Documento Electrónico' : 'Vista de Comprobante de Venta'}
								<Badge
									variant={
										recordData.estado_sri === 'AUTHORIZED'
											? 'default'
											: recordData.estado_sri === 'NO_ELECTRONIC'
												? 'secondary'
												: 'destructive'
									}
									className='text-xs'>
									{recordData.estado_sri === 'AUTHORIZED' && 'Autorizado SRI'}
									{recordData.estado_sri === 'NO_ELECTRONIC' && 'Comprobante Interno'}
									{recordData.estado_sri !== 'AUTHORIZED' &&
										recordData.estado_sri !== 'NO_ELECTRONIC' &&
										recordData.estado_sri}
								</Badge>
							</DialogTitle>
							<DialogDescription id='voucher-description' className='text-sm'>
								<div className='space-y-1'>
									{isElectronic && recordData.clave_acceso && (
										<div>
											Clave de acceso: <span className='font-mono text-xs'>{recordData.clave_acceso}</span>
										</div>
									)}
									<div className='flex gap-4'>
										<span>
											{isElectronic ? 'Factura' : 'Comprobante'}: #{recordData.code}
										</span>
										<span>Fecha: {formatDate(recordData.createdAt)}</span>
										<span>Total: {formatPrice(recordData.total)}</span>
									</div>
									<div>
										Cliente: {recordData.customer?.firstName} {recordData.customer?.lastName} -{' '}
										{recordData.customer?.identificationNumber}
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
							/>
						</DialogClose>
					</div>
				</DialogHeader>

				<div className='flex flex-1 flex-col gap-4'>
					{/* Tabs solo si es documento electrónico, sino solo mostrar ticket */}
					{isElectronic ? (
						<Tabs
							value={activeTab}
							onValueChange={value => setActiveTab(value as 'pdf' | 'ticket')}
							className='flex flex-1 flex-col'>
							<TabsList className='grid w-full max-w-md grid-cols-2'>
								<TabsTrigger value='pdf' className='flex items-center gap-2'>
									<Icons.fileText className='h-4 w-4' />
									Factura Electrónica
								</TabsTrigger>
								<TabsTrigger value='ticket' className='flex items-center gap-2'>
									<Icons.receipt className='h-4 w-4' />
									Vista de Ticket
								</TabsTrigger>
							</TabsList>

							<TabsContent value='pdf' className='mt-4 flex flex-1 flex-col'>
								<div className='flex-1 overflow-hidden'>
									{isLoadingPreview ? (
										<div className='flex h-full items-center justify-center'>
											<SpinnerLoader text='Cargando factura electrónica...' />
										</div>
									) : pdfUrl ? (
										<iframe
											src={pdfUrl}
											className='h-full w-full rounded-lg border'
											title='Factura Electrónica PDF'
											sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
										/>
									) : (
										<div className='flex h-full items-center justify-center'>
											<div className='flex flex-col items-center gap-2'>
												<Icons.fileText className='text-muted-foreground h-8 w-8' />
												<p className='text-muted-foreground text-sm'>No se pudo cargar la factura electrónica</p>
											</div>
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='ticket' className='mt-4 flex flex-1 flex-col overflow-hidden'>
								<div className='mb-4 text-center'>
									<h3 className='text-sm font-medium text-gray-600'>Vista previa del ticket de venta</h3>
									<p className='text-xs text-gray-500'>Formato optimizado para impresoras térmicas (80mm)</p>
								</div>
								<ScrollArea className='max-h-96 flex-1 overflow-auto'>
									<div className='flex justify-center'>{renderTicketPreview()}</div>
								</ScrollArea>
							</TabsContent>
						</Tabs>
					) : (
						// Vista solo de ticket para documentos NO_ELECTRONIC
						<div className='flex flex-1 flex-col overflow-hidden'>
							<div className='mb-4 border-b pb-2'>
								<h3 className='flex items-center gap-2 text-lg font-semibold'>
									<Icons.receipt className='h-5 w-5' />
									Comprobante de Venta
								</h3>
								<p className='text-sm text-gray-600'>Formato optimizado para impresoras térmicas (80mm)</p>
							</div>
							<ScrollArea className='flex-1 rounded-lg bg-gray-50 p-4'>
								<div className='flex justify-center'>{renderTicketPreview()}</div>
							</ScrollArea>
						</div>
					)}

					{/* Botones de acción dinámicos */}
					<div className='flex items-center justify-between gap-2 border-t pt-4'>{renderActionButtons()}</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
