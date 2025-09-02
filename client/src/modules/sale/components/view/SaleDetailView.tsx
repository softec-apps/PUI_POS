'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { I_Sale } from '@/common/types/modules/sale'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import api from '@/lib/axios'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { useSale } from '@/common/hooks/useSale'
import { PaymentMethodLabels_ES } from '@/common/enums/sale.enum'
import { formatDate } from '@/common/utils/dateFormater-util'
import { StatCard } from '@/components/layout/organims/StatCard'
import { Button } from '@/components/ui/button'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoDate } from '../atoms/InfoDate'
import { MethodPaymentBadge } from '../atoms/MethodPaymentBadge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface SaleDetailViewProps {
	saleId: string
}

export function SaleDetailView({ saleId }: SaleDetailViewProps) {
	const { getSaleById } = useSale()
	const [saleData, setSale] = useState<I_Sale | null>(null)
	const [loadingSale, setSaleLoading] = useState(true)
	const [errorSale, setSaleError] = useState<string | null>(null)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showRefundDialog, setShowRefundDialog] = useState(false)

	// Estados para PDF preview
	const [showPreviewDialog, setShowPreviewDialog] = useState(false)
	const [pdfUrl, setPdfUrl] = useState<string>('')
	const [isLoadingPreview, setIsLoadingPreview] = useState(false)
	const [isDownloading, setIsDownloading] = useState<{ pdf: boolean; xml: boolean }>({
		pdf: false,
		xml: false,
	})
	const [isPrinting, setIsPrinting] = useState(false)

	useEffect(() => {
		const fetchSale = async () => {
			try {
				setSaleLoading(true)
				setSaleError(null)
				const data = await getSaleById(saleId)
				setSale(data)
			} catch (err: any) {
				setSaleError(err.response?.data?.error?.message || 'Error desconocido')
			} finally {
				setSaleLoading(false)
			}
		}

		if (saleId) fetchSale()
	}, [saleId, getSaleById])

	const saleStatus = useMemo(() => {
		if (!saleData) return { label: 'Desconocido', variant: 'secondary' as const }

		const statuses = {
			completed: { label: 'Completada', variant: 'default' as const },
			pending: { label: 'Pendiente', variant: 'secondary' as const },
			cancelled: { label: 'Cancelada', variant: 'destructive' as const },
			refunded: { label: 'Reembolsada', variant: 'outline' as const },
		}

		return statuses.completed // Default fallback
	}, [saleData])

	// Función para imprimir el PDF - MOVIDA DESPUÉS de la declaración de pdfUrl
	const handlePrintPDF = useCallback(
		async (fromDialog: boolean = false) => {
			if (!saleData?.clave_acceso || saleData?.estado_sri !== 'AUTHORIZED') {
				console.error('No hay factura autorizada para imprimir')
				return
			}

			setIsPrinting(true)

			try {
				let printUrl = pdfUrl

				// Si no tenemos la URL del PDF o estamos imprimiendo desde el dropdown, cargarla
				if (!printUrl || !fromDialog) {
					const response = await api.get(`${ENDPOINT_API.BILLING}/${saleData.clave_acceso}/pdf`, {
						responseType: 'blob',
					})

					const blob = new Blob([response.data], { type: 'application/pdf' })
					printUrl = window.URL.createObjectURL(blob)

					// Si estamos en el diálogo, actualizar el estado también
					if (fromDialog) {
						setPdfUrl(printUrl)
					}
				}

				// Crear un iframe oculto para imprimir
				const iframe = document.createElement('iframe')
				iframe.style.display = 'none'
				iframe.src = printUrl

				// Cuando el iframe esté cargado, imprimir
				iframe.onload = () => {
					try {
						iframe.contentWindow?.focus()
						iframe.contentWindow?.print()
					} catch (error) {
						console.error('Error al imprimir:', error)
						// Fallback: abrir en nueva ventana e imprimir
						const printWindow = window.open(printUrl, '_blank')
						if (printWindow) {
							printWindow.onload = () => printWindow.print()
						}
					}
				}

				document.body.appendChild(iframe)

				// Limpiar después de un tiempo
				setTimeout(() => {
					if (document.body.contains(iframe)) {
						document.body.removeChild(iframe)
					}
					// No revocar la URL si estamos en el diálogo para poder reutilizarla
					if (!fromDialog) {
						window.URL.revokeObjectURL(printUrl)
					}
				}, 5000)
			} catch (error) {
				console.error('Error al cargar el PDF para imprimir:', error)
			} finally {
				setIsPrinting(false)
			}
		},
		[pdfUrl, saleData?.clave_acceso, saleData?.estado_sri]
	)

	// Funciones para manejo de archivos
	const downloadFile = async (type: 'pdf' | 'xml', endpoint: string, mimeType: string, extension: string) => {
		if (!saleData?.clave_acceso) return

		setIsDownloading(prev => ({ ...prev, [type]: true }))

		try {
			const response = await api.get(endpoint, {
				responseType: 'blob',
			})

			const blob = new Blob([response.data], { type: mimeType })
			const url = window.URL.createObjectURL(blob)

			const contentDisposition = response.headers['content-disposition']
			const fileName = contentDisposition
				? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
				: `documento_${saleData.clave_acceso}.${extension}`

			const link = document.createElement('a')
			link.href = url
			link.download = fileName
			document.body.appendChild(link)
			link.click()

			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		} catch (error) {
			console.error(`Error al descargar ${type.toUpperCase()}:`, error)
		} finally {
			setIsDownloading(prev => ({ ...prev, [type]: false }))
		}
	}

	const handleViewInvoice = async () => {
		if (!saleData?.clave_acceso || saleData?.estado_sri !== 'AUTHORIZED') return

		setIsLoadingPreview(true)
		setShowPreviewDialog(true)

		try {
			const response = await api.get(`${ENDPOINT_API.BILLING}/${saleData.clave_acceso}/pdf`, {
				responseType: 'blob',
			})

			const blob = new Blob([response.data], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			setPdfUrl(url)
		} catch (error) {
			console.error('Error al cargar la previa del PDF:', error)
			setShowPreviewDialog(false)
		} finally {
			setIsLoadingPreview(false)
		}
	}

	const handleDownloadPDF = async () => {
		if (saleData?.clave_acceso && saleData?.estado_sri === 'AUTHORIZED' && !isDownloading.pdf) {
			await downloadFile('pdf', `${ENDPOINT_API.BILLING}/${saleData.clave_acceso}/pdf`, 'application/pdf', 'pdf')
		}
	}

	const handleDownloadXML = async () => {
		if (saleData?.clave_acceso && saleData?.estado_sri === 'AUTHORIZED' && !isDownloading.xml) {
			await downloadFile('xml', `${ENDPOINT_API.BILLING}/${saleData.clave_acceso}/xml`, 'application/xml', 'xml')
		}
	}

	const handleClosePreview = () => {
		setShowPreviewDialog(false)
		if (pdfUrl) {
			window.URL.revokeObjectURL(pdfUrl)
			setPdfUrl('')
		}
	}

	const handleSendEmail = () => {
		console.log('Enviando por email...')
	}

	const handleRefund = () => {
		console.log('Procesando reembolso...')
		setShowRefundDialog(false)
	}

	const handleDelete = () => {
		console.log('Eliminando venta...')
		setShowDeleteDialog(false)
	}

	if (loadingSale)
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoader text='Cargando datos...' />
			</div>
		)

	if (errorSale) return <FatalErrorState />
	if (!saleData) return <NotFoundState />

	return (
		<div className='space-y-8'>
			{/* Header with Actions */}
			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardHeader className='flex flex-row items-center justify-between p-0'>
					<div className='flex items-center gap-4'>
						<Link href={ROUTE_PATH.ADMIN.SALES}>
							<button className='bg-accent cursor-pointer rounded-full p-2 transition-all duration-500'>
								<Icons.arrowNarrowLeft className='h-5 w-5' />
							</button>
						</Link>

						<div className='flex flex-col'>
							<Typography variant='h3' className='font-bold uppercase'>
								#{saleData.code}
							</Typography>
						</div>
					</div>

					{/* Action Buttons - Solo el dropdown */}
					<div className='flex items-center gap-2'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ActionButton variant='secondary' icon={<Icons.dotsVertical />} size='sm' text='Acciones' />
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-56'>
								{/* Opción de imprimir */}
								<DropdownMenuItem onClick={handlePrintPDF}>
									<Icons.printer className='mr-2 h-4 w-4' />
									Imprimir
								</DropdownMenuItem>

								{/* Opciones de factura electrónica */}
								{saleData.clave_acceso && saleData.estado_sri === 'AUTHORIZED' && (
									<>
										<DropdownMenuItem onClick={handleViewInvoice}>
											<Icons.file className='mr-2 h-4 w-4' />
											Ver Factura
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading.pdf}>
											{isDownloading.pdf ? (
												<Icons.spinnerSimple className='mr-2 h-4 w-4 animate-spin' />
											) : (
												<Icons.download className='mr-2 h-4 w-4' />
											)}
											Descargar PDF
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleDownloadXML} disabled={isDownloading.xml}>
											{isDownloading.xml ? (
												<Icons.spinnerSimple className='mr-2 h-4 w-4 animate-spin' />
											) : (
												<Icons.download className='mr-2 h-4 w-4' />
											)}
											Descargar XML
										</DropdownMenuItem>
									</>
								)}

								{/* Opción de email */}
								<DropdownMenuItem onClick={handleSendEmail}>
									<Icons.mail className='mr-2 h-4 w-4' />
									Enviar por Email
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								{/* Opción de reembolso */}
								<DropdownMenuItem onClick={() => setShowRefundDialog(true)}>
									<Icons.sTurnDown className='mr-2 h-4 w-4' />
									Reembolsar
								</DropdownMenuItem>

								{/* Opción de duplicar */}
								<DropdownMenuItem>
									<Icons.copy className='mr-2 h-4 w-4' />
									Duplicar venta
								</DropdownMenuItem>

								<DropdownMenuSeparator />

								{/* Opción de eliminar */}
								<DropdownMenuItem
									onClick={() => setShowDeleteDialog(true)}
									className='text-destructive focus:text-destructive'>
									<Icons.trash className='mr-2 h-4 w-4' />
									Eliminar
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
			</Card>

			{/* Statistics Overview */}
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					title='Total'
					value={`${formatPrice(saleData.total)}`}
					icon={<Icons.currencyDollar className='h-5 w-5' />}
					footerText='Importe total facturado'
					variant='success'
				/>
				<StatCard
					title='Cambio'
					value={`${formatPrice(saleData.change)}`}
					icon={<Icons.userDollar className='h-5 w-5' />}
					footerText={`Monto recibido${formatPrice(saleData.receivedAmount)}`}
					variant='info'
				/>
				<StatCard
					title='Pago'
					value={PaymentMethodLabels_ES[saleData?.paymentMethod] || 'No especificado'}
					icon={<Icons.payment className='h-5 w-5' />}
					footerText='Forma de pago utilizada'
					variant='indigo'
				/>
				<StatCard
					title='Estado SRI'
					value={saleData.estado_sri === 'AUTHORIZED' ? 'Autorizada' : saleData.estado_sri || 'Sin Factura'}
					icon={
						saleData.estado_sri === 'AUTHORIZED' ? (
							<Icons.checkCircle className='h-5 w-5' />
						) : saleData.estado_sri ? (
							<Icons.clock className='h-5 w-5' />
						) : (
							<Icons.infoCircle className='h-5 w-5' />
						)
					}
					footerText={
						saleData.estado_sri === 'AUTHORIZED'
							? 'Factura electrónica autorizada'
							: saleData.estado_sri
								? 'Procesando en SRI'
								: 'No aplica factura electrónica'
					}
					variant={saleData.estado_sri === 'AUTHORIZED' ? 'success' : saleData.estado_sri ? 'warning' : 'secondary'}
				/>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				{/* Left Column - Invoice and Products */}
				<div className='space-y-0 lg:col-span-2'>
					<Tabs defaultValue='products' className='w-full space-y-4'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='products'>Productos</TabsTrigger>
							<TabsTrigger value='history'>Historial</TabsTrigger>
						</TabsList>

						{/* Products Detail */}
						<TabsContent value='products'>
							<ScrollArea className='h-[calc(50dvh+3rem)] min-h-[calc(50dvh-1rem)]'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Producto</TableHead>
											<TableHead>Cnt</TableHead>
											<TableHead>PVP</TableHead>
											<TableHead>Total</TableHead>
											<TableHead>Acciones</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{saleData.items.map((item, idx) => (
											<TableRow key={idx}>
												<TableCell>
													<div className='flex items-center gap-3'>
														<ImageControl
															imageUrl={item?.product?.photo?.path}
															enableHover={false}
															enableClick={false}
															imageHeight={40}
															imageWidth={40}
														/>
														<div>
															<Typography variant='span' className='font-medium'>
																{item.product?.name}
															</Typography>
															<Typography variant='small' className='text-muted-foreground block'>
																{item.product?.code}
															</Typography>
														</div>
													</div>
												</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>{formatPrice(item.unitPrice)}</TableCell>
												<TableCell>{formatPrice(item.totalPrice)}</TableCell>
												<TableCell>
													<Link href={`${ROUTE_PATH.ADMIN.PRODUCT}/${item.product.id}`}>
														<ActionButton tooltip='Ver detalles' icon={<Icons.link />} size='icon' variant='ghost' />
													</Link>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</ScrollArea>
						</TabsContent>

						{/* Sale History */}
						<TabsContent value='history'>
							<div className='space-y-4'>
								{[
									{
										date: saleData.createdAt,
										action: 'Venta creada',
										description: 'Se registró la venta en el sistema',
										icon: Icons.plus,
										variant: 'success' as const,
									},
									{
										date: saleData.createdAt,
										action: 'Pago procesado',
										description: `Pago de ${formatPrice(saleData.total)} procesado exitosamente via ${PaymentMethodLabels_ES[saleData.paymentMethod]}`,
										icon: Icons.calendar,
										variant: 'success' as const,
									},
									{
										date: saleData.createdAt,
										action: 'Factura generada',
										description: 'Se generó la factura electrónica',
										icon: Icons.fileText,
										variant: 'default' as const,
									},
								].map((event, idx) => (
									<div key={idx} className='flex items-start gap-4'>
										<div
											className={`rounded-full p-2 ${
												event.variant === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
											}`}>
											<event.icon className='h-4 w-4' />
										</div>

										<div className='flex-1 space-y-1'>
											<div className='flex items-center justify-between'>
												<Typography variant='span' className='font-medium'>
													{event.action}
												</Typography>
												<Typography variant='small' className='text-muted-foreground'>
													{formatDate(event.date)}
												</Typography>
											</div>
											<Typography variant='small' className='text-muted-foreground'>
												{event.description}
											</Typography>
										</div>
									</div>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Right Column - Customer Info and Analytics */}
				<div className='space-y-6'>
					{/* Payment Info */}
					<Card>
						<CardHeader>Resumen</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-3'>
								{/* Fecha de la transacción */}
								<div className='flex items-center justify-between gap-2'>
									<Typography variant='small' className='text-muted-foreground'>
										<InfoDate recordData={saleData} />
									</Typography>

									<div className='flex items-center gap-2'>
										<MethodPaymentBadge type={saleData?.paymentMethod} />
										{/* Agregando ícono representativo */}
										{saleData.paymentMethod === 'credit_card' && <i className='fa fa-credit-card text-blue-500' />}
										{saleData.paymentMethod === 'paypal' && <i className='fa fa-paypal text-yellow-500' />}

										<Badge variant='success'>Pagado</Badge>
									</div>
								</div>

								{/* Monto recibido */}
								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Monto recibido
									</Typography>
									<Typography variant='small' className='text-primary font-medium'>
										${formatPrice(saleData.receivedAmount)}
									</Typography>
								</div>

								{/* Cambio entregado */}
								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Cambio
									</Typography>
									<Typography variant='small' className='font-medium text-sky-500'>
										${formatPrice(saleData.change)}
									</Typography>
								</div>

								{/* Impuestos aplicados */}
								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Impuestos
									</Typography>
									<Typography variant='small' className='font-medium text-amber-500'>
										+${formatPrice(saleData.taxAmount)}
									</Typography>
								</div>

								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Descuento
									</Typography>
									<Typography variant='small' className='font-medium text-emerald-600'>
										-${formatPrice(saleData.discount ?? '')}
									</Typography>
								</div>

								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Subtotal
									</Typography>
									<Typography variant='small' className='text-primary font-medium'>
										${formatPrice(saleData.subtotal)}
									</Typography>
								</div>

								{/* Total final */}
								<div className='flex items-center justify-between font-medium'>
									<Typography variant='small' className='text-muted-foreground'>
										Total
									</Typography>
									<Typography variant='span' className='text-lg font-bold'>
										${formatPrice(saleData.total)}
									</Typography>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Customer Info */}
					<Card>
						<CardHeader className='flex items-center justify-between'>
							Cliente
							<Link href={`${ROUTE_PATH.ADMIN.CUSTOMERS}/${saleData.customer.id}`}>
								<ActionButton tooltip='Ver detalles' icon={<Icons.link />} size='icon' variant='ghost' />
							</Link>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-3'>
								{[
									{
										label: 'Nombres',
										value: `${saleData.customer.firstName} ${saleData.customer.lastName}`,
									},
									{
										label: `${IdentificationTypeLabels_ES[saleData.customer.identificationType]}`,
										value: `${saleData.customer.identificationNumber}`,
									},
									{
										label: 'Email',
										value: saleData.customer.email || 'No registrado',
									},
									{
										label: 'Cliente desde',
										value: formatDate(saleData.customer.createdAt),
									},
								].map((item, idx) => (
									<div key={idx} className='flex items-center justify-between'>
										<Typography variant='small' className='text-muted-foreground'>
											{item.label}
										</Typography>
										<Typography variant='small' className='text-primary font-medium'>
											{item.value}
										</Typography>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

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
						<DialogDescription>Clave de acceso: {saleData.clave_acceso}</DialogDescription>
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

			{/* Refund Dialog */}
			<AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Procesar reembolso?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción procesará un reembolso por ${formatPrice(saleData.total)} para la venta #
							{saleData?.code || saleData?.id?.slice(-8).toUpperCase()}. El cliente recibirá el monto completo de
							vuelta.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleRefund}>Procesar reembolso</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. La venta #{saleData?.code || saleData.id.slice(-8).toUpperCase()}
							será eliminada permanentemente del sistema.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
