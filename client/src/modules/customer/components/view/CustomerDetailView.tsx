'use client'

import { useEffect, useState } from 'react'
import { useCustomer } from '@/common/hooks/useCustomer'
import { I_Customer } from '@/common/types/modules/customer'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/layout/atoms/Badge'

interface CustomerDetailViewProps {
	customerId: string
}

// Fake data generators
const generateFakePurchases = () => {
	return Array.from({ length: 5 }, (_, i) => ({
		id: `purchase-${i + 1}`,
		date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
		product: `Product ${i + 1}`,
		quantity: Math.floor(Math.random() * 10) + 1,
		price: (Math.random() * 100 + 10).toFixed(2),
		status: ['Completed', 'Pending', 'Cancelled'][Math.floor(Math.random() * 3)],
	}))
}

const generateFakeSales = () => {
	return Array.from({ length: 8 }, (_, i) => ({
		id: `sale-${i + 1}`,
		date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
		product: `Product ${i + 1}`,
		amount: (Math.random() * 500 + 50).toFixed(2),
		payment: ['Credit Card', 'Cash', 'Transfer'][Math.floor(Math.random() * 3)],
		status: ['Delivered', 'Shipped', 'Processing'][Math.floor(Math.random() * 3)],
	}))
}

const generateFakeQuotes = () => {
	return Array.from({ length: 3 }, (_, i) => ({
		id: `quote-${i + 1}`,
		date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
		description: `Quote for ${['Office Supplies', 'Equipment', 'Services'][i % 3]}`,
		amount: (Math.random() * 1000 + 100).toFixed(2),
		validUntil: new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString(),
		status: ['Pending', 'Accepted', 'Expired'][Math.floor(Math.random() * 3)],
	}))
}

const generateFakeProformas = () => {
	return Array.from({ length: 4 }, (_, i) => ({
		id: `proforma-${i + 1}`,
		date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
		reference: `PRO-${Math.floor(Math.random() * 1000)}`,
		total: (Math.random() * 2000 + 200).toFixed(2),
		status: ['Draft', 'Sent', 'Approved'][Math.floor(Math.random() * 3)],
	}))
}

export function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
	const { getCustomerById } = useCustomer()
	const [customerData, setCustomer] = useState<I_Customer | null>(null)
	const [loadingCustomer, setCustomerLoading] = useState(true)
	const [errorCustomer, setCustomerError] = useState<string | null>(null)

	// Fake data states
	const [purchases] = useState(generateFakePurchases())
	const [sales] = useState(generateFakeSales())
	const [quotes] = useState(generateFakeQuotes())
	const [proformas] = useState(generateFakeProformas())

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setCustomerLoading(true)
				setCustomerError(null)
				const productData = await getCustomerById(customerId)
				setCustomer(productData)
			} catch (err) {
				setCustomerError(err.response.data.error.message)
				console.error('Error fetching product:', err)
			} finally {
				setCustomerLoading(false)
			}
		}

		if (customerId) fetchProduct()
	}, [customerId, getCustomerById])

	if (loadingCustomer) {
		return (
			<div className='flex h-screen flex-1 flex-col items-center justify-center'>
				<SpinnerLoader text='Cargando... Por favor espera' />
			</div>
		)
	}

	if (!customerData) {
		return (
			<div className='flex h-screen flex-1 flex-col items-center justify-center'>
				<NotFoundState />
			</div>
		)
	}

	if (errorCustomer) {
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)
	}

	// Generate initials for avatar
	const initials = `${customerData?.firstName?.charAt(0)}${customerData?.lastName?.charAt(0)}`

	return (
		<div className='flex flex-col gap-8'>
			{/* Header */}
			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardContent className='p-0'>
					<div className='flex items-center gap-4'>
						<Link href={ROUTE_PATH.ADMIN.CUSTOMERS} className='text-muted-foreground'>
							<div className='bg-muted hover:bg-accent rounded-full p-4 transition-all duration-500'>
								<Icons.arrowNarrowLeft />
							</div>
						</Link>

						<div className='flex flex-1 items-start gap-4'>
							<Avatar className='h-16 w-16'>
								<AvatarImage src={customerData.firstName} />
								<AvatarFallback className='bg-primary text-primary-foreground'>{initials}</AvatarFallback>
							</Avatar>

							<div className='flex-1'>
								<div className='mb-2 line-clamp-1 break-words'>
									<Typography variant='h3'>
										{customerData.firstName} {customerData.lastName}
									</Typography>
								</div>

								<div className='flex flex-wrap items-center justify-between gap-2'>
									<div className='flex flex-wrap items-center gap-2'>
										<Badge variant='info' text={customerData.identificationNumber} />
										<Badge variant='secondary' text={customerData.email} />
									</div>

									<div className='flex gap-2'>
										<Button variant='outline' size='sm'>
											<Icons.edit className='mr-2 h-4 w-4' />
											Edit
										</Button>
										<Button variant='outline' size='sm'>
											<Icons.dots className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Customer Summary Cards */}
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card className='border-border/50 bg-card dark:bg-accent/20 w-full rounded-2xl p-4 px-0 shadow-none'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Compras totales</CardTitle>
						<Icons.shoppingCart className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>$4,320.89</div>
						<p className='text-muted-foreground text-xs'>+12% del mes pasado</p>
					</CardContent>
				</Card>

				<Card className='border-border/50 bg-card dark:bg-accent/20 w-full rounded-2xl p-4 px-0 shadow-none'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Ventas totales</CardTitle>
						<Icons.userDollar className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>$12,345.00</div>
						<p className='text-muted-foreground text-xs'>+20.1% del mes pasado</p>
					</CardContent>
				</Card>

				<Card className='border-border/50 bg-card dark:bg-accent/20 w-full rounded-2xl p-4 px-0 shadow-none'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Cotizaciones activas</CardTitle>
						<Icons.file className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>3</div>
						<p className='text-muted-foreground text-xs'>1 expirando pronto</p>
					</CardContent>
				</Card>

				<Card className='border-border/50 bg-card dark:bg-accent/20 w-full rounded-2xl p-4 px-0 shadow-none'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Cliente desde</CardTitle>
						<Icons.calendar className='text-muted-foreground h-4 w-4' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>Jan 2024</div>
						<p className='text-muted-foreground text-xs'>1.5 años</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue='sales' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='sales'>Ventas</TabsTrigger>
					<TabsTrigger value='purchases'>Compras</TabsTrigger>
					<TabsTrigger value='quotes'>Cotizaciones</TabsTrigger>
					<TabsTrigger value='proformas'>Proformas</TabsTrigger>
					<TabsTrigger value='details'>Detalles del cliente</TabsTrigger>
				</TabsList>

				{/* Sales Tab */}
				<TabsContent value='sales'>
					<Card className='border-none bg-transparent p-0 shadow-none'>
						<CardHeader className='p-0'>
							<div className='flex items-center justify-between'>
								<CardTitle>Historial de Ventas</CardTitle>
								<Button variant='outline' size='sm'>
									<Icons.download className='mr-2 h-4 w-4' />
									Exportar
								</Button>
							</div>
						</CardHeader>

						<CardContent className='p-0'>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='p-3 text-left'>ID</th>
											<th className='p-3 text-left'>Fecha</th>
											<th className='p-3 text-left'>Producto</th>
											<th className='p-3 text-left'>Monto</th>
											<th className='p-3 text-left'>Pago</th>
											<th className='p-3 text-left'>Estado</th>
										</tr>
									</thead>
									<tbody>
										{sales.map(sale => (
											<tr key={sale.id} className='hover:bg-muted/50 border-b'>
												<td className='p-3'>{sale.id}</td>
												<td className='p-3'>{sale.date}</td>
												<td className='p-3'>{sale.product}</td>
												<td className='p-3'>${sale.amount}</td>
												<td className='p-3'>{sale.payment}</td>
												<td className='p-3'>
													<Badge variant={sale.status === 'Delivered' ? 'default' : 'outline'}>{sale.status}</Badge>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Purchases Tab */}
				<TabsContent value='purchases'>
					<Card className='border-none bg-transparent p-0 shadow-none'>
						<CardHeader className='p-0'>
							<div className='flex items-center justify-between'>
								<CardTitle>Historial de Compras</CardTitle>
								<Button variant='outline' size='sm'>
									<Icons.download className='mr-2 h-4 w-4' />
									Exportar
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='p-3 text-left'>ID</th>
											<th className='p-3 text-left'>Fecha</th>
											<th className='p-3 text-left'>Producto</th>
											<th className='p-3 text-left'>Cantidad</th>
											<th className='p-3 text-left'>Precio</th>
											<th className='p-3 text-left'>Estado</th>
										</tr>
									</thead>
									<tbody>
										{purchases.map(purchase => (
											<tr key={purchase.id} className='hover:bg-muted/50 border-b'>
												<td className='p-3'>{purchase.id}</td>
												<td className='p-3'>{purchase.date}</td>
												<td className='p-3'>{purchase.product}</td>
												<td className='p-3'>{purchase.quantity}</td>
												<td className='p-3'>${purchase.price}</td>
												<td className='p-3'>
													<Badge
														variant={
															purchase.status === 'Completed'
																? 'default'
																: purchase.status === 'Pending'
																	? 'secondary'
																	: 'destructive'
														}>
														{purchase.status}
													</Badge>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Quotes Tab */}
				<TabsContent value='quotes'>
					<Card className='border-none bg-transparent p-0 shadow-none'>
						<CardHeader className='p-0'>
							<div className='flex items-center justify-between'>
								<CardTitle>Cotizaciones</CardTitle>
								<Button variant='outline' size='sm'>
									<Icons.download className='mr-2 h-4 w-4' />
									Exportar
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{quotes.map(quote => (
									<Card key={quote.id} className='hover:border-primary'>
										<CardHeader>
											<CardTitle className='text-lg'>{quote.description}</CardTitle>
											<div className='flex items-center justify-between'>
												<Badge variant={quote.status === 'Accepted' ? 'default' : 'outline'}>{quote.status}</Badge>
												<span className='text-muted-foreground text-sm'>Válido hasta: {quote.validUntil}</span>
											</div>
										</CardHeader>
										<CardContent>
											<div className='flex items-center justify-between'>
												<span className='text-2xl font-bold'>${quote.amount}</span>
												<Button variant='ghost' size='sm'>
													<Icons.eye className='mr-2 h-4 w-4' />
													Ver detalle
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Proformas Tab */}
				<TabsContent value='proformas'>
					<Card className='border-none bg-transparent p-0 shadow-none'>
						<CardHeader className='p-0'>
							<div className='flex items-center justify-between'>
								<CardTitle>Proformas</CardTitle>
								<Button variant='outline' size='sm'>
									<Icons.download className='mr-2 h-4 w-4' />
									Exportar
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='p-3 text-left'>ID</th>
											<th className='p-3 text-left'>Fecha</th>
											<th className='p-3 text-left'>Referencia</th>
											<th className='p-3 text-left'>Total</th>
											<th className='p-3 text-left'>Estado</th>
											<th className='p-3 text-left'>Acciones</th>
										</tr>
									</thead>
									<tbody>
										{proformas.map(proforma => (
											<tr key={proforma.id} className='hover:bg-muted/50 border-b'>
												<td className='p-3'>{proforma.id}</td>
												<td className='p-3'>{proforma.date}</td>
												<td className='p-3'>{proforma.reference}</td>
												<td className='p-3'>${proforma.total}</td>
												<td className='p-3'>
													<Badge
														variant={
															proforma.status === 'Approved'
																? 'default'
																: proforma.status === 'Sent'
																	? 'secondary'
																	: 'outline'
														}>
														{proforma.status}
													</Badge>
												</td>
												<td className='p-3'>
													<Button variant='ghost' size='sm'>
														<Icons.download className='h-4 w-4' />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='details'>
					<Card className='border-none bg-transparent p-0 shadow-none'>
						<CardHeader className='p-0'>
							<CardTitle>Customer Details</CardTitle>
						</CardHeader>

						<CardContent className='p-0'>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='space-y-4'>
									<div>
										<Typography variant='small' className='text-muted-foreground'>
											Full Name
										</Typography>
										<Typography variant='p'>
											{customerData.firstName} {customerData.lastName}
										</Typography>
									</div>
									<div>
										<Typography variant='small' className='text-muted-foreground'>
											Email
										</Typography>
										<Typography variant='p'>{customerData.email}</Typography>
									</div>
									<div>
										<Typography variant='small' className='text-muted-foreground'>
											Phone
										</Typography>
										<Typography variant='p'>{customerData.phone}</Typography>
									</div>
								</div>
								<div className='space-y-4'>
									<div>
										<Typography variant='small' className='text-muted-foreground'>
											Address
										</Typography>
										<Typography variant='p'>{customerData.address || 'Not specified'}</Typography>
									</div>

									<div>
										<Typography variant='small' className='text-muted-foreground'>
											Customer Type
										</Typography>
										<Typography variant='p'>{customerData.customerType}</Typography>
									</div>

									<div>
										<Typography variant='small' className='text-muted-foreground'>
											Identification
										</Typography>
										<Typography variant='p'>{customerData.identificationNumber}</Typography>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
