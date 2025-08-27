'use client'

import { useEffect, useMemo, useState } from 'react'
import { I_Sale } from '@/common/types/modules/sale'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { useSale } from '@/common/hooks/useSale'
import { PaymentMethodLabels_ES } from '@/common/enums/sale.enum'
import { formatDate } from '@/common/utils/dateFormater-util'
import { StatCard } from '@/components/layout/organims/StatCard'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { CustomerTypeLabels_ES, IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

	const handlePrintInvoice = () => {
		window.print()
	}

	const handleDownloadPDF = () => {
		console.log('Descargando PDF...')
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
							<Button variant='secondary' size='lg' className='rounded-full'>
								<Icons.arrowNarrowLeft className='mr-2 h-4 w-4' />
							</Button>
						</Link>
						<div className='flex flex-col'>
							<Typography variant='h3' className='font-bold uppercase'>
								Venta #{saleData.code}
							</Typography>
							<div className='mt-1 flex items-center gap-2'>
								<Typography variant='small' className='text-muted-foreground'>
									<InfoDate recordData={saleData} />
								</Typography>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex items-center gap-2'>
						<Button onClick={handlePrintInvoice} variant='outline' size='sm'>
							<Icons.printer className='mr-2 h-4 w-4' />
							Imprimir
						</Button>
						<Button onClick={handleDownloadPDF} variant='outline' size='sm'>
							<Icons.download className='mr-2 h-4 w-4' />
							PDF
						</Button>
						<Button onClick={handleSendEmail} variant='outline' size='sm'>
							<Icons.mail className='mr-2 h-4 w-4' />
							Email
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='outline' size='sm'>
									<Icons.dotsVertical className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onClick={() => setShowRefundDialog(true)}>
									<Icons.sTurnDown className='mr-2 h-4 w-4' />
									Reembolsar
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Icons.copy className='mr-2 h-4 w-4' />
									Duplicar venta
								</DropdownMenuItem>
								<DropdownMenuSeparator />
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
					title='Total de la venta'
					value={formatPrice(saleData.total)}
					icon={<Icons.moneyBag className='h-5 w-5' />}
					footerText='Importe total facturado'
					variant='success'
				/>
				<StatCard
					title='Productos vendidos'
					value={saleData.totalItems.toString()}
					icon={<Icons.box className='h-5 w-5' />}
					footerText='Cantidad de items'
				/>
				<StatCard
					title='Método de pago'
					value={PaymentMethodLabels_ES[saleData?.paymentMethod] || 'No especificado'}
					icon={<Icons.chevronDown className='h-5 w-5' />}
					footerText='Forma de pago utilizada'
				/>
				<StatCard
					title='Cambio entregado'
					value={formatPrice(saleData.change)}
					icon={<Icons.receipt className='h-5 w-5' />}
					footerText={`Recibido: ${formatPrice(saleData.receivedAmount)}`}
				/>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				{/* Left Column - Invoice and Products */}
				<div className='space-y-0 lg:col-span-2'>
					<Tabs defaultValue='invoice' className='w-full space-y-4'>
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger value='invoice'>Factura</TabsTrigger>
							<TabsTrigger value='products'>Productos</TabsTrigger>
							<TabsTrigger value='history'>Historial</TabsTrigger>
						</TabsList>

						{/* Electronic Invoice - Ecuador SRI Standard */}
						<TabsContent value='invoice'>
							<Card className='bg-transparent p-0'>
								<CardHeader className='bg-muted/50 rounded-t-2xl border-b p-4'>
									<div className='flex items-start justify-between'>
										<div>
											<Typography variant='h4' className='mb-2 font-bold'>
												FACTURA ELECTRÓNICA
											</Typography>
											<Typography variant='small' className='text-muted-foreground'>
												Documento Autorizado SRI
											</Typography>
										</div>
										<div className='text-right'>
											<Typography variant='h5' className='font-bold'>
												001-001-{String(saleData.sequentialNumber || saleData.id.slice(-9)).padStart(9, '0')}
											</Typography>
											<Typography variant='small' className='text-muted-foreground'>
												Fecha: {formatDate(saleData.createdAt)}
											</Typography>
										</div>
									</div>
								</CardHeader>

								<CardContent className='space-y-6 p-6'>
									{/* Company Info */}
									<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
										<div className='space-y-2'>
											<Typography variant='h6' className='text-primary font-semibold'>
												DATOS DEL EMISOR
											</Typography>
											<div className='space-y-1 text-sm'>
												<p className='font-medium'>Mi Empresa S.A.</p>
												<p>RUC: 0992345678001</p>
												<p>Dirección Matriz: Av. 9 de Octubre 123 y Malecón</p>
												<p>Guayaquil - Ecuador</p>
												<p>Tel: (04) 234-5678</p>
												<p>Email: facturacion@miempresa.com.ec</p>
												<p className='mt-2 text-xs font-medium'>CONTRIBUYENTE ESPECIAL Nro: 5368</p>
												<p className='text-xs'>OBLIGADO A LLEVAR CONTABILIDAD: SI</p>
											</div>
										</div>

										<div className='space-y-2'>
											<Typography variant='h6' className='text-primary font-semibold'>
												DATOS DEL COMPRADOR
											</Typography>
											<div className='space-y-1 text-sm'>
												<p className='font-medium'>
													{saleData.customer.firstName} {saleData.customer.lastName}
												</p>
												<p>
													{saleData.customer.identificationType === 'ruc'
														? 'RUC'
														: saleData.customer.identificationType === 'cedula'
															? 'Cédula'
															: saleData.customer.identificationType === 'passport'
																? 'Pasaporte'
																: 'Identificación'}
													: {saleData.customer.identificationNumber}
												</p>
												<p>Email: {saleData.customer.email || 'consumidorfinal@sri.gob.ec'}</p>
												<p>Tel: {saleData.customer.phone || 'No registrado'}</p>
												<p>Dirección: {saleData.customer.address || 'No registrada'}</p>
											</div>
										</div>
									</div>

									<Separator />

									{/* Products Table */}
									<div>
										<Typography variant='h6' className='mb-4 font-semibold'>
											DETALLE
										</Typography>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Código</TableHead>
													<TableHead>Descripción</TableHead>
													<TableHead className='text-center'>Cant.</TableHead>
													<TableHead className='text-right'>P. Unitario</TableHead>
													<TableHead className='text-right'>Descuento</TableHead>
													<TableHead className='text-right'>P. Total</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{saleData.items.map((item, idx) => (
													<TableRow key={idx}>
														<TableCell className='font-mono text-sm'>
															{item.product?.code || item.productCode || 'PROD' + String(idx + 1).padStart(3, '0')}
														</TableCell>
														<TableCell>
															<div className='flex items-center gap-3'>
																{item.product?.photo && (
																	<ImageControl
																		recordData={item.product.photo}
																		enableHover={false}
																		enableClick={false}
																		imageHeight={40}
																		imageWidth={40}
																		className='rounded border'
																	/>
																)}
																<div>
																	<Typography variant='span' className='font-medium'>
																		{item.product?.name ?? item.productName}
																	</Typography>
																</div>
															</div>
														</TableCell>
														<TableCell className='text-center font-medium'>{item.quantity}</TableCell>
														<TableCell className='text-right'>{formatPrice(item.unitPrice)}</TableCell>
														<TableCell className='text-right'>{formatPrice(item.discount || 0)}</TableCell>
														<TableCell className='text-right font-medium'>{formatPrice(item.totalPrice)}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>

									<Separator />

									{/* Tax Details */}
									<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
										<div>
											<Typography variant='h6' className='mb-3 font-semibold'>
												INFORMACIÓN ADICIONAL
											</Typography>
											<div className='space-y-1 text-sm'>
												<p>
													<strong>Forma de Pago:</strong> {saleData.paymentMethod || 'Efectivo'}
												</p>
												<p>
													<strong>Moneda:</strong> USD
												</p>
												<p>
													<strong>Vendedor:</strong> {saleData.seller || 'Sistema POS'}
												</p>
												{saleData.notes && (
													<p>
														<strong>Observaciones:</strong> {saleData.notes}
													</p>
												)}
											</div>
										</div>

										<div className='w-full space-y-2'>
											<div className='flex justify-between'>
												<span>Subtotal 12%:</span>
												<span>{formatPrice(saleData.subtotal)}</span>
											</div>
											<div className='flex justify-between'>
												<span>Subtotal 0%:</span>
												<span>{formatPrice(0)}</span>
											</div>
											<div className='flex justify-between'>
												<span>Subtotal No Objeto de IVA:</span>
												<span>{formatPrice(0)}</span>
											</div>
											<div className='flex justify-between'>
												<span>Subtotal Exento de IVA:</span>
												<span>{formatPrice(0)}</span>
											</div>
											<div className='flex justify-between'>
												<span>Subtotal Sin Impuestos:</span>
												<span>{formatPrice(saleData.subtotal)}</span>
											</div>
											<div className='flex justify-between'>
												<span>Total Descuento:</span>
												<span>{formatPrice(saleData.discount || 0)}</span>
											</div>
											<div className='flex justify-between'>
												<span>ICE:</span>
												<span>{formatPrice(0)}</span>
											</div>
											<div className='flex justify-between'>
												<span>IRBPNR:</span>
												<span>{formatPrice(0)}</span>
											</div>
											<div className='flex justify-between'>
												<span>IVA 12%:</span>
												<span>{formatPrice(saleData.taxAmount)}</span>
											</div>
											<Separator />
											<div className='flex justify-between text-lg font-bold'>
												<span>VALOR TOTAL:</span>
												<span>{formatPrice(saleData.total)}</span>
											</div>
										</div>
									</div>

									{/* Authorization and QR Code */}
									<div className='grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2'>
										<div className='space-y-2 text-xs'>
											<Typography variant='h6' className='mb-3 text-sm font-semibold'>
												AUTORIZACIÓN SRI
											</Typography>
											<p>
												<strong>Número de Autorización:</strong>
											</p>
											<p className='font-mono break-all'>
												{saleData.authorizationNumber || '2024010112345678901234567890123456789012345678'}
											</p>
											<p>
												<strong>Fecha Autorización:</strong> {formatDate(saleData.createdAt)}
											</p>
											<p>
												<strong>Ambiente:</strong> PRODUCCIÓN
											</p>
											<p>
												<strong>Emisión:</strong> NORMAL
											</p>
											<p>
												<strong>Clave de Acceso:</strong>
											</p>
											<p className='font-mono text-xs break-all'>
												{saleData.accessKey ||
													formatDate(saleData.createdAt).replace(/[-:]/g, '') +
														'01099234567800110010010000000001123456789012345678'}
											</p>
										</div>

										<div className='flex flex-col items-center space-y-4'>
											<div className='bg-muted flex h-32 w-32 items-center justify-center rounded-lg'>
												<Icons.caretLeft className='text-muted-foreground h-16 w-16' />
											</div>
											<p className='text-muted-foreground text-center text-xs'>
												Código QR para verificación en
												<br />
												<strong>www.sri.gob.ec</strong>
											</p>
										</div>
									</div>

									{/* Footer */}
									<div className='border-t pt-4'>
										<div className='text-muted-foreground space-y-1 text-center text-xs'>
											<p>
												<strong>ORIGINAL:</strong> ADQUIRIENTE / <strong>COPIA:</strong> EMISOR
											</p>
											<p>Esta es una representación gráfica de una Factura Electrónica</p>
											<p>
												Consulte su documento en: <strong>www.sri.gob.ec</strong>
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Products Detail */}
						<TabsContent value='products'>
							<Card className='border-none bg-transparent p-0'>
								<CardHeader className='p-0'>
									<Typography variant='h5' className='font-semibold'>
										Productos de la venta
									</Typography>
								</CardHeader>
								<CardContent className='p-0'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Producto</TableHead>
												<TableHead>Categoría</TableHead>
												<TableHead className='text-center'>Cantidad</TableHead>
												<TableHead className='text-right'>Precio</TableHead>
												<TableHead className='text-right'>Total</TableHead>
												<TableHead></TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{saleData.items.map((item, idx) => (
												<TableRow key={idx}>
													<TableCell>
														<div className='flex items-center gap-3'>
															{item.product?.photo && (
																<ImageControl
																	recordData={item.product.photo}
																	enableHover={false}
																	enableClick={false}
																	imageHeight={48}
																	imageWidth={48}
																	className='rounded-lg border'
																/>
															)}
															<div>
																<Typography variant='span' className='font-medium'>
																	{item.product?.name ?? item.productName}
																</Typography>
																<Typography variant='small' className='text-muted-foreground block'>
																	SKU: {item.product?.code || item.productCode || 'N/A'}
																</Typography>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<Badge variant='outline'>{item.product?.category?.name || 'Sin categoría'}</Badge>
													</TableCell>
													<TableCell className='text-center'>
														<Badge variant='secondary'>{item.quantity}</Badge>
													</TableCell>
													<TableCell className='text-right font-medium'>{formatPrice(item.unitPrice)}</TableCell>
													<TableCell className='text-right font-semibold'>{formatPrice(item.totalPrice)}</TableCell>
													<TableCell>
														<Button variant='ghost' size='sm' asChild>
															<Link href={`${ROUTE_PATH.ADMIN.PRODUCT}/${item.product?.id ?? ''}`}>
																<Icons.link className='h-4 w-4' />
															</Link>
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Sale History */}
						<TabsContent value='history'>
							<Card>
								<CardHeader>
									<Typography variant='h5' className='font-semibold'>
										Historial de la venta
									</Typography>
								</CardHeader>
								<CardContent>
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
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* Right Column - Customer Info and Analytics */}
				<div className='space-y-6'>
					{/* Customer Info */}
					<Card>
						<CardHeader className='flex items-center justify-between'>
							<Typography variant='h6' className='flex items-center gap-2 font-semibold'>
								Cliente
							</Typography>
							<Link href={`${ROUTE_PATH.ADMIN.CUSTOMERS}/${saleData.customer.id}`} className='hover:underline'>
								Ver perfil
							</Link>
						</CardHeader>
						<CardContent className='space-y-4'>
							{[
								{
									icon: Icons.user,
									label: 'Nombres',
									value: `${saleData.customer.firstName} ${saleData.customer.lastName}`,
								},
								{
									icon: Icons.id,
									label: `${IdentificationTypeLabels_ES[saleData.customer.identificationType]}`,
									value: `${saleData.customer.identificationNumber}`,
								},
								{
									icon: Icons.mail,
									label: 'Email',
									value: saleData.customer.email || 'No registrado',
								},
								{
									icon: Icons.calendar,
									label: 'Cliente desde',
									value: formatDate(saleData.customer.createdAt),
								},
							].map((item, idx) => (
								<div key={idx} className='flex items-start gap-3'>
									<item.icon className='text-muted-foreground h-5 w-5' />
									<div className='flex-1 space-y-1'>
										<Typography variant='small' className='text-muted-foreground'>
											{item.label}
										</Typography>
										<Typography variant='small' className='text-primary'>
											{item.value}
										</Typography>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Payment Info */}
					<Card>
						<CardHeader>
							<Typography variant='h6' className='flex items-center gap-2 font-semibold'>
								Información de pago
							</Typography>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Método de pago
									</Typography>
									<MethodPaymentBadge type={saleData.paymentMethod} />
								</div>

								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Estado del pago
									</Typography>
									<Badge variant='default'>Pagado</Badge>
								</div>

								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Monto recibido
									</Typography>
									<Typography variant='small' className='font-medium'>
										${formatPrice(saleData.receivedAmount)}
									</Typography>
								</div>

								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Cambio entregado
									</Typography>
									<Typography variant='small' className='font-medium text-green-600'>
										${formatPrice(saleData.change)}
									</Typography>
								</div>

								<div className='flex items-center justify-between'>
									<Typography variant='small' className='text-muted-foreground'>
										Impuestos aplicados
									</Typography>
									<Typography variant='small' className='font-medium'>
										{saleData.taxRate}% (${formatPrice(saleData.taxAmount)})
									</Typography>
								</div>

								<Separator />

								<div className='flex items-center justify-between font-medium'>
									<Typography variant='small'>Total final</Typography>
									<Typography variant='span' className='text-lg font-bold'>
										${formatPrice(saleData.total)}
									</Typography>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

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
