'use client'

import React, { useMemo, useState } from 'react'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSale } from '@/common/hooks/useSale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { KPICard } from '@/components/layout/organims/KPICard'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { I_User } from '@/common/types/modules/user'
import { I_Sale, I_SaleItem } from '@/common/types/modules/sale'

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
	selectedUser: string | null
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
	const [selectedUserId, setSelectedUserId] = useState<string>('all')

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
			limit: 9999, // Trae todos los registros
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

	const salesData: I_Sale[] = recordsData?.data?.items || []

	// Obtener lista única de vendedores/responsables para el filtro
	const availableSellers = useMemo(() => {
		const sellers = salesData
			.filter(sale => sale.user)
			.map(sale => ({
				id: sale.user!.id,
				name: `${sale.user!.firstName} ${sale.user!.lastName}`,
				email: sale.user!.email,
			}))

		// Eliminar duplicados basándose en el ID
		const uniqueSellers = sellers.filter((seller, index, self) => index === self.findIndex(s => s.id === seller.id))

		return uniqueSellers
	}, [salesData])

	// Filtrar ventas por vendedor/responsable seleccionado
	const filteredSalesData = useMemo(() => {
		if (selectedUserId === 'all') return salesData
		return salesData.filter(sale => sale.user?.id === selectedUserId)
	}, [salesData, selectedUserId])

	// Calcular el resumen diario CORREGIDO - Considerando el change
	const dailySummary = useMemo<DailySummary>(() => {
		const today = new Date()

		const summary: DailySummary = {
			date: today.toISOString().split('T')[0],
			totalSales: filteredSalesData.length,
			totalAmount: 0,
			grossProfit: 0,
			netProfit: 0,
			taxAmount: 0,
			cashSales: 0,
			cashAmount: 0,
			cardSales: 0,
			cardAmount: 0,
			digitalSales: 0,
			digitalAmount: 0,
			averageTicket: 0,
			selectedUser: selectedUserId,
		}

		filteredSalesData.forEach(sale => {
			const amount = Number(sale.total) || 0
			const tax = Number(sale.taxAmount) || 0
			const change = Number(sale.change) || 0 // Considerar el cambio

			summary.totalAmount += amount
			summary.taxAmount += tax

			// Calcular ganancias (revenue) sumando el revenue de cada item
			if (sale.items && Array.isArray(sale.items)) {
				sale.items.forEach(item => {
					const revenue = Number(item.revenue) || 0
					summary.grossProfit += revenue
					summary.netProfit += revenue - tax // Neto es revenue menos impuestos
				})
			}

			// CORRECCIÓN: Procesar TODOS los métodos de pago de cada venta
			if (sale.paymentMethods && Array.isArray(sale.paymentMethods)) {
				// Contador para métodos de pago en esta venta
				let hasCash = false
				let hasCard = false
				let hasDigital = false

				sale.paymentMethods.forEach(paymentMethod => {
					const method = normalizePaymentMethod(paymentMethod.method)
					let paymentAmount = Number(paymentMethod.amount) || 0

					// Si es efectivo, restar el cambio del monto
					if (method === 'cash' && change > 0) paymentAmount = Math.max(0, paymentAmount - change)

					switch (method) {
						case 'cash':
							summary.cashAmount += paymentAmount
							hasCash = true
							break
						case 'card':
							summary.cardAmount += paymentAmount
							hasCard = true
							break
						case 'digital':
							summary.digitalAmount += paymentAmount
							hasDigital = true
							break
					}
				})

				// Contar la venta para cada método de pago utilizado
				if (hasCash) summary.cashSales++
				if (hasCard) summary.cardSales++
				if (hasDigital) summary.digitalSales++
			} else {
				// Fallback: si no hay paymentMethods array, asumir efectivo
				summary.cashSales++
				// También considerar el cambio en el fallback
				summary.cashAmount += Math.max(0, amount - change)
			}
		})

		// Calcular ticket promedio
		summary.averageTicket = summary.totalAmount / summary.totalSales

		return summary
	}, [filteredSalesData, selectedUserId])

	// Datos de métodos de pago para la visualización CORREGIDOS
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
			percentage: (method.amount / dailySummary.totalAmount) * 100,
		}))
	}, [dailySummary])

	const hasData = dailySummary.totalSales > 0

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (!open && onClose) onClose()
	}

	return (
		<Drawer open={isOpen} onOpenChange={handleOpenChange}>
			<DrawerTrigger>{trigger || <ActionButton icon={<Icons.moneyBag />} text='Cuadrar ventas' />}</DrawerTrigger>

			<DrawerContent>
				{!hasData && !loading ? (
					<div className='flex flex-1 items-center justify-center p-8'>
						<Card className='border-none bg-transparent shadow-none'>
							<CardContent className='py-8 text-center'>
								<Icons.shoppingBag className='mx-auto mb-4 h-16 w-16 opacity-30' />
								<h3 className='mb-2 text-lg font-semibold'>
									{selectedUserId === 'all' ? 'No hay ventas registradas' : 'No hay ventas para este filtro'}
								</h3>
								<p className='text-muted-foreground max-w-md text-sm'>
									{selectedUserId === 'all'
										? 'Para el día de hoy no se han registrado ventas'
										: 'Intenta con otro vendedor o selecciona "Todos"'}
								</p>
							</CardContent>
						</Card>
					</div>
				) : error ? (
					<FatalErrorState />
				) : (
					<div className='mx-auto flex h-full w-full max-w-5xl flex-col'>
						<DrawerHeader>
							<DrawerTitle className='text-xl'>Cuadre de ventas diarias</DrawerTitle>

							<div className='flex items-center justify-between'>
								<DrawerDescription className='text-sm'>
									Resumen de las ventas del día {formatDate(new Date())}
								</DrawerDescription>
								<div className='flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:gap-4'>
									<Select value={selectedUserId} onValueChange={setSelectedUserId}>
										<SelectTrigger className='w-auto'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent align='end'>
											<SelectItem value='all'>
												<div className='flex items-center gap-2'>
													<Icons.userGroup className='h-4 w-4' />
													Todos
												</div>
											</SelectItem>
											{availableSellers.map(seller => (
												<SelectItem key={seller.id} value={seller.id}>
													<div className='flex items-center gap-2'>
														<Icons.userCheck className='h-4 w-4' />
														{seller.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</DrawerHeader>

						<div className='space-y-6 pb-5'>
							{/* Grid de resumen principal - Mejorada la disposición */}
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
								{/* Total de Ventas */}
								<KPICard
									title='Ventas'
									value={dailySummary.totalSales}
									description='Cantidad de ventas'
									isLoading={loading}
								/>
								{/* Total Recaudado */}
								<KPICard
									title='Total Caja'
									value={dailySummary.totalAmount}
									isCurrency
									description='Total recaudado'
									isLoading={loading}
								/>
								{/* Ganancias */}
								<KPICard
									title='Ganancias Netas'
									value={dailySummary.netProfit}
									isCurrency
									description='Ganancias del día'
									isLoading={loading}
								/>
							</div>

							{/* Desglose por Método de Pago - Mejorado */}
							<Card className='border-none bg-transparent p-0'>
								<CardHeader className='p-0'>
									<CardTitle className='flex items-center gap-2'>
										<Icons.creditCard className='h-5 w-5' />
										Desglose por Método de Pago
									</CardTitle>
									<CardDescription>
										Distribución de ventas según el método de pago (considerando cambio para efectivo)
									</CardDescription>
								</CardHeader>

								<CardContent className='p-0'>
									{/* Grid mejorado para métodos de pago */}
									<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
										{paymentMethods
											.filter(method => method.count > 0 || method.amount > 0)
											.map(method => (
												<Card
													className='border-border/50 hover:border-border p-0 transition-colors'
													key={method.method}>
													<CardContent className='p-4'>
														<div className='mb-3 flex items-center justify-between'>
															<span className='text-sm font-medium'>{method.label}</span>
															{getPaymentMethodIcon(method.method)}
														</div>
														<div
															className={`mb-2 text-2xl font-bold ${
																method.method === 'cash'
																	? 'text-green-600 dark:text-green-400'
																	: method.method === 'card'
																		? 'text-blue-600 dark:text-blue-400'
																		: 'text-purple-600 dark:text-purple-400'
															}`}>
															{formatPrice(method.amount)}
														</div>
														<div className='text-muted-foreground flex items-center justify-between text-xs'>
															<span>Corresponde la total {method.percentage.toFixed(2)}% de ventas</span>
														</div>
													</CardContent>
												</Card>
											))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	)
}
