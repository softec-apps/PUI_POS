'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCustomer } from '@/common/hooks/useCustomer'
import { I_Customer } from '@/common/types/modules/customer'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { useSale } from '@/common/hooks/useSale'
import { usePagination } from '../../hooks/usePagination'
import { PurchasesTab } from '../templates/DetailPurchasesTab'
import { IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'
import { formatDate } from '@/common/utils/dateFormater-util'
import { StatCard } from '@/components/layout/organims/StatCard'

interface CustomerDetailViewProps {
	customerId: string
}

export function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
	const { getCustomerById } = useCustomer()
	const [customerData, setCustomer] = useState<I_Customer | null>(null)
	const [loadingCustomer, setCustomerLoading] = useState(true)
	const [errorCustomer, setCustomerError] = useState<string | null>(null)

	const pagination = usePagination()

	const salesParams = useMemo(() => {
		return {
			search: pagination.searchTerm,
			page: pagination.pagination.page,
			limit: pagination.pagination.limit,
			sort: pagination.currentSort ? [pagination.currentSort] : undefined,
			filters: { customerId: customerData?.id },
		}
	}, [pagination, customerData?.id])

	const { recordsData, loading: loadingSales, refetchSales } = useSale(salesParams)

	useEffect(() => {
		const fetchCustomer = async () => {
			try {
				setCustomerLoading(true)
				setCustomerError(null)
				const data = await getCustomerById(customerId)
				setCustomer(data)
			} catch (err: any) {
				setCustomerError(err.response?.data?.error?.message || 'Error desconocido')
			} finally {
				setCustomerLoading(false)
			}
		}

		if (customerId) fetchCustomer()
	}, [customerId, getCustomerById])

	if (loadingCustomer) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoader text='Cargando datos...' />
			</div>
		)
	}

	if (errorCustomer) return <FatalErrorState />

	if (!customerData) return <NotFoundState />

	return (
		<div className='space-y-8'>
			{/* Header */}
			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardHeader className='flex flex-row items-center gap-4 p-0'>
					<Link href={ROUTE_PATH.ADMIN.CUSTOMERS}>
						<button className='bg-accent cursor-pointer rounded-full p-2 transition-all duration-500'>
							<Icons.arrowNarrowLeft className='h-5 w-5' />
						</button>
					</Link>

					<div className='flex flex-1 flex-col'>
						<Typography variant='h4' className='font-semibold'>
							{customerData.firstName} {customerData.lastName}
						</Typography>
					</div>
				</CardHeader>
			</Card>

			<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
				<div className='space-y-6 md:col-span-2'>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						<StatCard
							title='Balance'
							value='$45,231.89'
							icon={<Icons.moneyBag className='h-5 w-5' />}
							footerText='Desde el mes pasado'
						/>

						<StatCard
							title='Produtos'
							value='145'
							icon={<Icons.box className='h-5 w-5' />}
							footerText='Desde el mes pasado'
							variant='destructive'
						/>

						<StatCard
							title='Compras'
							value='$12,225'
							icon={<Icons.shoppingCart className='h-5 w-5' />}
							footerText='Desde el mes pasado'
							footerIcon={<Icons.download className='h-4 w-4' />}
							variant='success'
						/>
					</div>

					{/* Tabs */}
					<Tabs defaultValue='purchases' className='mt-10 w-full space-y-8'>
						<TabsList className='grid w-full grid-cols-4 rounded-xl'>
							<TabsTrigger value='purchases'>Compras</TabsTrigger>
							<TabsTrigger value='quotes'>Cotizaciones</TabsTrigger>
							<TabsTrigger value='proformas'>Proformas</TabsTrigger>
							<TabsTrigger value='returns'>Devoluciones</TabsTrigger>
						</TabsList>

						<TabsContent value='purchases'>
							<PurchasesTab recordsData={recordsData} isRefreshing={loadingSales} onRefresh={refetchSales} />
						</TabsContent>

						<TabsContent value='returns'>
							<div className='text-muted-foreground'>Proximamente...</div>
						</TabsContent>
						<TabsContent value='quotes'>
							<div className='text-muted-foreground'>Proximamente...</div>
						</TabsContent>
						<TabsContent value='proformas'>
							<div className='text-muted-foreground'>Proximamente...</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Customer Details Sidebar */}
				<div className='space-y-6'>
					<Card className='bg-transparent'>
						<CardHeader>
							<Typography variant='p' className='text-primary font-semibold'>
								Información del cliente
							</Typography>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div className='flex items-center gap-3'>
								<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
									<Icons.id className='text-muted-foreground h-5 w-5' />
								</div>

								<div className='flex flex-col space-y-1'>
									<Typography variant='small' className=''>
										{IdentificationTypeLabels_ES[customerData.identificationType]}
									</Typography>
									<Typography variant='small' className='text-primary text-sm'>
										{customerData.identificationNumber}
									</Typography>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
									<Icons.mail className='text-muted-foreground h-5 w-5' />
								</div>
								<div className='flex flex-col space-y-1'>
									<Typography variant='small' className=''>
										E-mail
									</Typography>
									<Typography variant='small' className='text-primary text-sm'>
										{customerData.email || 'No asignado'}
									</Typography>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
									<Icons.phone className='text-muted-foreground h-5 w-5' />
								</div>
								<div className='flex flex-col space-y-1'>
									<Typography variant='small' className=''>
										Teléfono
									</Typography>
									<Typography variant='small' className='text-primary text-sm'>
										{customerData.phone || 'No asignado'}
									</Typography>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
									<Icons.mapPin className='text-muted-foreground h-5 w-5' />
								</div>
								<div className='flex flex-col space-y-1'>
									<Typography variant='small' className=''>
										Dirección
									</Typography>
									<Typography variant='small' className='text-primary text-sm'>
										{customerData.address || 'No asignado'}
									</Typography>
								</div>
							</div>

							<div className='flex items-center gap-3'>
								<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
									<Icons.calendar className='text-muted-foreground h-5 w-5' />
								</div>
								<div className='flex flex-col space-y-1'>
									<Typography variant='small' className=''>
										Registro
									</Typography>
									<Typography variant='small' className='text-primary text-sm'>
										{formatDate(customerData.createdAt)}
									</Typography>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
