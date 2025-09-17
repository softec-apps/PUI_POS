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
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { SoomFeatureBanner } from '@/components/layout/organims/SoomFeat'

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

						<div className='flex flex-col gap-2'>
							<Typography variant='h3' className='font-bold uppercase'>
								#{saleData.code}
							</Typography>

							{saleData?.clave_acceso && (
								<div className='flex items-center gap-2'>
									<Typography variant='span' className='font-mono'>
										Clave acceso SRI: {saleData?.clave_acceso}
									</Typography>
									<ActionButton
										size='icon'
										variant='secondary'
										icon={<Icons.copy />}
										tooltip='Copiar'
										onClick={() => {
											navigator.clipboard.writeText(saleData.clave_acceso)
											toast.info('Clave de acceso copiada')
										}}
									/>
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons - Solo el dropdown */}
					<div className='flex items-center gap-2'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<ActionButton variant='secondary' icon={<Icons.dotsVertical />} size='sm' text='Acciones' />
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-auto'>
								{/* Opción de imprimir */}
								<DropdownMenuItem onClick={handlePrintPDF}>
									<Icons.printer className='h-4 w-4' />
									Imprimir
								</DropdownMenuItem>

								{/* Opciones de factura electrónica */}
								{saleData.clave_acceso && saleData.estado_sri === 'AUTHORIZED' && (
									<>
										<DropdownMenuItem onClick={handleViewInvoice}>
											<Icons.file className='h-4 w-4' />
											Ver factura SRI
										</DropdownMenuItem>

										{/* 
										<DropdownMenuItem onClick={handleDownloadPDF} disabled={isDownloading.pdf}>
											{isDownloading.pdf ? (
												<Icons.spinnerSimple className='h-4 w-4 animate-spin' />
											) : (
												<Icons.download className='h-4 w-4' />
											)}
											Descargar PDF
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleDownloadXML} disabled={isDownloading.xml}>
											{isDownloading.xml ? (
												<Icons.spinnerSimple className='h-4 w-4 animate-spin' />
											) : (
												<Icons.download className='h-4 w-4' />
											)}
											Descargar XML
										</DropdownMenuItem>
										*/}
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
			</Card>

			{/* Main Content */}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				{/* Left Column - Invoice and Products */}
				<div className='space-y-6 lg:col-span-2'>
					{/* Statistics Overview */}
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3'>
						<StatCard
							title='Total'
							value={`$${formatPrice(saleData?.total)}`}
							icon={<Icons.currencyDollar className='h-5 w-5' />}
							footerText='Total facturado + impuestos'
						/>
						<StatCard
							title='Cambio'
							value={`$${formatPrice(saleData?.change)}`}
							icon={<Icons.userDollar className='h-5 w-5' />}
							footerText={`Monto recibido $${formatPrice(saleData.receivedAmount)}`}
							variant='info'
						/>
						<StatCard
							title='Estado SRI'
							value={saleData.estado_sri === 'AUTHORIZED' ? 'Autorizado' : saleData.estado_sri || 'Sin Factura'}
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
									? 'Factura electrónica'
									: saleData.estado_sri
										? 'Procesando en SRI'
										: 'No aplica factura electrónica'
							}
							variant={saleData.estado_sri === 'AUTHORIZED' ? 'success' : saleData.estado_sri ? 'warning' : 'secondary'}
						/>
					</div>

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
											<TableHead>Ganancia</TableHead>
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
														<div className='max-w-72 truncate'>
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
												<TableCell>{formatPrice(item.revenue)}</TableCell>
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
							<SoomFeatureBanner />
						</TabsContent>
					</Tabs>
				</div>

				{/* Right Column - Customer Info and Analytics */}
				<div className='space-y-6'>
					{/* Summary sale */}
					<Card>
						<CardHeader className='flex items-center justify-between'>
							Resumen
							<Typography variant='small' className='text-primary font-medium'>
								{formatDate(saleData?.createdAt)}
							</Typography>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-3'>
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
										-${formatPrice(saleData?.discount ?? '')}
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

								<div className='flex items-center justify-between font-medium'>
									<Typography variant='small' className='text-muted-foreground'>
										Ganancia
									</Typography>
									<Typography variant='span' className='text-lg font-bold'>
										${formatPrice(saleData.items?.reduce((acc, item) => acc + (item.revenue || 0), 0))}
									</Typography>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment methods Info */}
					<Card className='dark:bg-popover bg-muted'>
						<CardHeader>Métodos de pago</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-3'>
								<div className='space-y-3'>
									{Array.isArray(saleData?.paymentMethods) && saleData.paymentMethods.length > 0 ? (
										saleData.paymentMethods.map((payment, idx) => (
											<div key={idx} className='flex items-center justify-between'>
												<Typography variant='small' className='text-muted-foreground'>
													{PaymentMethodLabels_ES[payment.method] || payment.method}
												</Typography>
												<Typography variant='small' className='text-primary font-medium'>
													${formatPrice(payment.amount)}
												</Typography>
											</div>
										))
									) : (
										<Typography variant='small' className='text-muted-foreground'>
											No especificado
										</Typography>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Customer Info */}
					<Card className='dark:bg-popover bg-muted'>
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
							<DialogTitle>Vista previa de factura SRI</DialogTitle>
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
								<iframe src={pdfUrl} className='h-full w-full border' title='Previa de Factura' />
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
