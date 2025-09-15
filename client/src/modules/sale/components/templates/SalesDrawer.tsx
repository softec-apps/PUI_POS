import React, { useMemo, useState, useEffect } from 'react'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	DrawerFooter,
	DrawerClose,
} from '@/components/ui/drawer'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSale } from '@/common/hooks/useSale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { KPICard } from '@/components/layout/organims/KPICard'
import { formatPrice } from '@/common/utils/formatPrice-util'

interface SalesDrawerProps {
	trigger?: React.ReactNode
	onClose?: () => void
}

interface DailySummary {
	date: string
	totalSales: number
	totalAmount: number
	grossProfit: number
	netProfit: number
	taxAmount: number
	cashSales: number
	cashAmount: number
	cardSales: number
	cardAmount: number
	digitalSales: number
	digitalAmount: number
	averageTicket: number
}

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('es-EC', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date)
}

// Función helper para crear fechas ISO en zona horaria local
const createLocalISODate = (
	year: number,
	month: number,
	day: number,
	hours = 0,
	minutes = 0,
	seconds = 0,
	milliseconds = 0
) => {
	const date = new Date(year, month, day, hours, minutes, seconds, milliseconds)
	return date.toISOString()
}

const getPaymentMethodIcon = (method: string) => {
	switch (method.toLowerCase()) {
		case 'cash':
		case 'efectivo':
			return <Icons.currencyDollar className='h-5 w-5 text-green-700 dark:text-green-300' />
		case 'card':
		case 'tarjeta':
			return <Icons.creditCard className='h-5 w-5 text-blue-700 dark:text-blue-300' />
		case 'digital':
			return <Icons.deviceMobile className='h-5 w-5 text-purple-700 dark:text-purple-300' />
	}
}

const normalizePaymentMethod = (method: string): string => {
	switch (method.toLowerCase()) {
		case 'cash':
		case 'efectivo':
			return 'cash'
		case 'card':
		case 'tarjeta':
			return 'card'
		case 'digital':
			return 'digital'
	}
}

export function SalesDrawer({ trigger, onClose }: SalesDrawerProps) {
	const [isOpen, setIsOpen] = useState(false)

	// Obtener el rango de fechas para el día actual en formato ISO
	const todayParams = useMemo(() => {
		const today = new Date()
		const year = today.getFullYear()
		const month = today.getMonth()
		const day = today.getDate()

		// Inicio del día (00:00:00.000)
		const startOfDay = createLocalISODate(year, month, day, 0, 0, 0, 0)

		// Final del día (23:59:59.999)
		const endOfDay = createLocalISODate(year, month, day, 23, 59, 59, 999)

		return {
			search: '',
			page: 1,
			limit: 9999,
			filters: {
				createdAt: {
					startDate: startOfDay,
					endDate: endOfDay,
				},
			},
		}
	}, [])

	// Solo ejecutar el hook cuando el drawer esté abierto
	const { recordsData, loading, error } = useSale(isOpen ? todayParams : undefined)

	const salesData = recordsData?.data?.items || []

	// Debug: agregar console.log para ver la estructura de datos
	useEffect(() => {
		if (salesData.length > 0) {
			console.log('Datos de ventas:', salesData)
			console.log('Primera venta:', salesData[0])
			console.log('Métodos de pago de primera venta:', salesData[0]?.paymentMethods)
		}
	}, [salesData])

	// Calcular el resumen diario
	const dailySummary = useMemo<DailySummary>(() => {
		const today = new Date()

		const summary: DailySummary = {
			date: today.toISOString().split('T')[0],
			totalSales: salesData.length,
			totalAmount: 0,
			grossProfit: 0, // Ganancias brutas (revenue)
			netProfit: 0, // Ganancias netas (revenue - costos)
			taxAmount: 0,
			cashSales: 0,
			cashAmount: 0,
			cardSales: 0,
			cardAmount: 0,
			digitalSales: 0,
			digitalAmount: 0,
			averageTicket: 0,
		}

		salesData.forEach(sale => {
			const amount = Number(sale.total) || 0
			const tax = Number(sale.taxAmount) || 0

			summary.totalAmount += amount
			summary.taxAmount += tax

			// Calcular ganancias (revenue) sumando el revenue de cada item
			if (sale.items && Array.isArray(sale.items)) {
				sale.items.forEach(item => {
					const revenue = Number(item.revenue) || 0
					summary.grossProfit += revenue
					summary.netProfit += revenue // En este caso, asumimos que revenue ya es ganancia neta
				})
			}

			// Procesar métodos de pago (pueden ser múltiples)
			if (sale.paymentMethods && Array.isArray(sale.paymentMethods)) {
				sale.paymentMethods.forEach(paymentMethod => {
					const method = normalizePaymentMethod(paymentMethod.method)
					const paymentAmount = Number(paymentMethod.amount) || 0

					switch (method) {
						case 'cash':
							// Solo incrementar sales count una vez por venta, no por método de pago
							if (!sale._cashCounted) {
								summary.cashSales++
								sale._cashCounted = true
							}
							summary.cashAmount += paymentAmount
							break
						case 'card':
							if (!sale._cardCounted) {
								summary.cardSales++
								sale._cardCounted = true
							}
							summary.cardAmount += paymentAmount
							break
						case 'digital':
							if (!sale._digitalCounted) {
								summary.digitalSales++
								sale._digitalCounted = true
							}
							summary.digitalAmount += paymentAmount
							break
					}
				})
			} else {
				// Fallback: si no hay paymentMethods array, asumir efectivo
				summary.cashSales++
				summary.cashAmount += amount
			}
		})

		// Calcular ticket promedio
		summary.averageTicket = summary.totalSales > 0 ? summary.totalAmount / summary.totalSales : 0

		return summary
	}, [salesData])

	// Datos de métodos de pago para la visualización
	const paymentMethods = useMemo(() => {
		const methods = [
			{
				method: 'cash',
				label: 'Efectivo',
				count: dailySummary.cashSales,
				amount: dailySummary.cashAmount,
				color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
			},
			{
				method: 'card',
				label: 'Tarjeta',
				count: dailySummary.cardSales,
				amount: dailySummary.cardAmount,
				color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
			},
			{
				method: 'digital',
				label: 'Digital',
				count: dailySummary.digitalSales,
				amount: dailySummary.digitalAmount,
				color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
			},
		]

		return methods.map(method => ({
			...method,
			percentage: dailySummary.totalAmount > 0 ? (method.amount / dailySummary.totalAmount) * 100 : 0,
		}))
	}, [dailySummary])

	const hasData = dailySummary.totalSales > 0

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (!open && onClose) {
			onClose()
		}
	}

	return (
		<Drawer open={isOpen} onOpenChange={handleOpenChange}>
			<DrawerTrigger>{trigger || <ActionButton icon={<Icons.moneyBag />} text='Cuadrar Ventas' />}</DrawerTrigger>

			<DrawerContent className='max-h-[85vh]'>
				<div className='mx-auto flex h-full w-full max-w-4xl flex-col'>
					<DrawerHeader className='flex-shrink-0'>
						<DrawerTitle>Cuadre de ventas diarias</DrawerTitle>
						<DrawerDescription>Resumen de las ventas del día {formatDate(new Date())}</DrawerDescription>
					</DrawerHeader>

					{/* Estado Vacío */}
					{!hasData ? (
						<Card className='border-none bg-transparent'>
							<CardContent className='flex items-center justify-center py-12'>
								<div className='text-muted-foreground text-center'>
									<Icons.shoppingBag className='mx-auto mb-4 h-12 w-12 opacity-50' />
									<p className='mb-2 text-lg font-medium'>No hay ventas registradas</p>
									<p className='text-sm'>Para el día de hoy</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div className='flex-1 overflow-y-auto px-4'>
							<div className='space-y-4 pb-4'>
								{loading ? (
									<div className='flex items-center justify-center py-20'>
										<SpinnerLoader text='Cuadrando ventas...' />
									</div>
								) : error ? (
									<div className='py-20'>
										<FatalErrorState />
									</div>
								) : (
									<>
										{/* Grid de resumen principal - 2 columnas en md, 3 en lg */}
										<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
											{/* Total de Ventas */}
											<KPICard
												title='Ventas'
												value={dailySummary.totalSales}
												description='Cantidad de ventas'
												isLoading={loading}
											/>

											{/* Total Recaudado */}
											<KPICard
												title='Caja'
												value={dailySummary.totalAmount}
												isCurrency
												description='Total recaudado en caja'
												isLoading={loading}
											/>

											{/* Ganancias */}
											<KPICard
												title='Ganancias'
												value={dailySummary.netProfit}
												isCurrency
												description='Ganancias netas del día'
												isLoading={loading}
											/>
										</div>

										{/* Desglose por Método de Pago */}
										<Card className='border-none bg-transparent p-0'>
											<CardHeader className='p-0'>
												<CardTitle>Desglose por Método de Pago</CardTitle>
												<CardDescription>Distribución de ventas según el método de pago</CardDescription>
											</CardHeader>

											<CardContent className='p-0'>
												{/* Grid responsive para métodos de pago */}
												<div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
													{paymentMethods.map(method => (
														<Card className='border-border/50' key={method.method}>
															<CardContent className='mb-2'>
																<div className='flex items-center justify-between'>
																	<div
																		className={`flex items-center ${
																			method.method === 'cash'
																				? 'text-green-500 dark:text-green-300'
																				: method.method === 'card'
																					? 'text-blue-500 dark:text-blue-500'
																					: 'text-purple-500 dark:text-purple-300'
																		}`}>
																		{method.label}
																	</div>
																	<div>{getPaymentMethodIcon(method.method)}</div>
																</div>
																<div
																	className={`text-2xl font-bold ${
																		method.method === 'cash'
																			? 'text-green-600 dark:text-green-300'
																			: method.method === 'card'
																				? 'text-blue-600 dark:text-blue-300'
																				: 'text-purple-600 dark:text-purple-300'
																	}`}>
																	{formatPrice(method.amount)}
																</div>
															</CardContent>

															<CardFooter>
																<span className='text-muted-foreground truncate text-xs'>
																	Representa el {method.percentage.toFixed(1)}% de las ventas
																</span>
															</CardFooter>
														</Card>
													))}
												</div>
											</CardContent>
										</Card>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	)
}
