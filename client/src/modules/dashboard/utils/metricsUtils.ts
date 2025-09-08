import { I_Sale } from '@/common/types/modules/sale'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'
import { getPeriodDates, getPreviousPeriodDates } from './dateUtils'

/**
 * Calcula todas las métricas avanzadas del dashboard a partir de los datos de ventas
 */
export const calculateAdvancedMetrics = (sales: I_Sale[], dateRange: string): DashboardMetrics => {
	if (!sales || sales.length === 0) {
		return getEmptyMetrics()
	}

	const { startDate, endDate } = getPeriodDates(dateRange)
	const { previousStartDate, previousEndDate } = getPreviousPeriodDates(dateRange, startDate, endDate)

	// Filtrar ventas por períodos
	const currentPeriodSales = filterSalesByPeriod(sales, startDate, endDate)
	const previousPeriodSales = dateRange !== '0' ? filterSalesByPeriod(sales, previousStartDate, previousEndDate) : []

	// Calcular métricas básicas
	const currentMetrics = calculateBasicMetrics(currentPeriodSales)
	const previousMetrics = calculateBasicMetrics(previousPeriodSales)

	// Calcular crecimientos
	const growthMetrics = calculateGrowthMetrics(currentMetrics, previousMetrics, dateRange)

	// Calcular métricas avanzadas
	const advancedMetrics = calculateAdvancedData(currentPeriodSales, startDate, endDate, dateRange)

	return {
		...currentMetrics,
		...growthMetrics,
		...advancedMetrics,
	}
}

/**
 * Retorna métricas vacías cuando no hay datos
 */
const getEmptyMetrics = (): DashboardMetrics => ({
	totalRevenue: 0,
	totalGrossProfit: 0,
	profitMargin: 0,
	uniqueCustomers: 0,
	totalSales: 0,
	averageTicket: 0,
	totalItems: 0,
	totalTaxes: 0,
	totalDiscounts: 0,
	electronicInvoices: 0,
	pendingInvoices: 0,
	noElectronicInvoices: 0,
	electronicInvoicePercentage: 0,
	revenueGrowth: 0,
	profitGrowth: 0,
	salesGrowth: 0,
	customersGrowth: 0,
	ticketGrowth: 0,
	salesByPaymentMethod: {},
	salesByMonth: [],
	topCustomers: [],
	topProducts: [],
	salesByDay: [],
	salesByStatus: {},
})

/**
 * Filtra las ventas por un período específico
 */
const filterSalesByPeriod = (sales: I_Sale[], startDate: Date, endDate: Date): I_Sale[] => {
	return sales.filter(sale => {
		const saleDate = new Date(sale.createdAt || sale.date)
		return saleDate >= startDate && saleDate <= endDate
	})
}

/**
 * Calcula métricas básicas de un conjunto de ventas
 */
const calculateBasicMetrics = (sales: I_Sale[]) => {
	const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0)
	const totalSales = sales.length
	const totalItems = sales.reduce((sum, sale) => sum + (sale.totalItems || 0), 0)
	const totalTaxes = sales.reduce((sum, sale) => sum + (sale.taxAmount || 0), 0)
	const totalDiscounts = sales.reduce((sum, sale) => sum + (sale.discount || 0), 0)
	const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
	const uniqueCustomers = new Set(sales.filter(sale => sale.customerId).map(sale => sale.customerId)).size

	// Calcular ganancias brutas totales
	const totalGrossProfit = sales.reduce((sum, sale) => {
		if (sale.items && Array.isArray(sale.items)) {
			return sum + sale.items.reduce((itemSum, item) => itemSum + (item.revenue || 0), 0)
		}
		return sum
	}, 0)

	// Calcular margen de ganancia
	const profitMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0

	// Métricas de facturas electrónicas
	const electronicInvoices = sales.filter(sale => sale.estado_sri === 'AUTHORIZED').length
	const pendingInvoices = sales.filter(sale => sale.estado_sri === 'PENDING').length
	const noElectronicInvoices = sales.filter(sale => sale.estado_sri === 'NO_ELECTRONIC' || !sale.estado_sri).length
	const electronicInvoicePercentage = totalSales > 0 ? (electronicInvoices / totalSales) * 100 : 0

	return {
		totalRevenue,
		totalGrossProfit,
		profitMargin,
		uniqueCustomers,
		totalSales,
		averageTicket,
		totalItems,
		totalTaxes,
		totalDiscounts,
		electronicInvoices,
		pendingInvoices,
		noElectronicInvoices,
		electronicInvoicePercentage,
	}
}

/**
 * Calcula las métricas de crecimiento comparando períodos
 */
const calculateGrowthMetrics = (current: any, previous: any, dateRange: string) => {
	if (dateRange === '0') {
		return {
			revenueGrowth: 0,
			profitGrowth: 0,
			salesGrowth: 0,
			customersGrowth: 0,
			ticketGrowth: 0,
		}
	}

	const revenueGrowth =
		previous.totalRevenue > 0 ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0

	const profitGrowth =
		previous.totalGrossProfit > 0
			? ((current.totalGrossProfit - previous.totalGrossProfit) / previous.totalGrossProfit) * 100
			: 0

	const salesGrowth =
		previous.totalSales > 0 ? ((current.totalSales - previous.totalSales) / previous.totalSales) * 100 : 0

	const customersGrowth =
		previous.uniqueCustomers > 0
			? ((current.uniqueCustomers - previous.uniqueCustomers) / previous.uniqueCustomers) * 100
			: 0

	const ticketGrowth =
		previous.averageTicket > 0 ? ((current.averageTicket - previous.averageTicket) / previous.averageTicket) * 100 : 0

	return {
		revenueGrowth,
		profitGrowth,
		salesGrowth,
		customersGrowth,
		ticketGrowth,
	}
}

/**
 * Calcula datos avanzados como top productos, clientes, etc.
 */
const calculateAdvancedData = (sales: I_Sale[], startDate: Date, endDate: Date, dateRange: string) => {
	return {
		salesByPaymentMethod: calculateSalesByPaymentMethod(sales),
		salesByStatus: calculateSalesByStatus(sales),
		salesByMonth: calculateSalesByMonth(sales, endDate, dateRange),
		salesByDay: calculateSalesByDay(sales, endDate, startDate),
		topCustomers: calculateTopCustomers(sales),
		topProducts: calculateTopProducts(sales),
	}
}

/**
 * Calcula las ventas por método de pago
 */
const calculateSalesByPaymentMethod = (sales: I_Sale[]): Record<string, number> => {
	return sales.reduce(
		(acc, sale) => {
			if (sale.paymentMethods && Array.isArray(sale.paymentMethods)) {
				sale.paymentMethods.forEach((method: any) => {
					const methodName = getPaymentMethodName(method.method)
					acc[methodName] = (acc[methodName] || 0) + (method.amount || 0)
				})
			} else {
				acc['Efectivo'] = (acc['Efectivo'] || 0) + (sale.total || 0)
			}
			return acc
		},
		{} as Record<string, number>
	)
}

/**
 * Obtiene el nombre legible del método de pago
 */
const getPaymentMethodName = (method: string): string => {
	switch (method) {
		case 'card':
			return 'Tarjeta'
		case 'cash':
			return 'Efectivo'
		case 'transfer':
			return 'Transferencia'
		default:
			return method || 'Efectivo'
	}
}

/**
 * Calcula las ventas por estado SRI
 */
const calculateSalesByStatus = (sales: I_Sale[]): Record<string, number> => {
	return sales.reduce(
		(acc, sale) => {
			const status = sale.estado_sri || 'NO_ELECTRONIC'
			acc[status] = (acc[status] || 0) + 1
			return acc
		},
		{} as Record<string, number>
	)
}

/**
 * Calcula las ventas por mes
 */
const calculateSalesByMonth = (sales: I_Sale[], endDate: Date, dateRange: string) => {
	const monthsToShow = dateRange === '0' ? 12 : Math.min(6, parseInt(dateRange) || 6)
	const salesByMonth = []

	for (let i = monthsToShow - 1; i >= 0; i--) {
		const monthDate = new Date(endDate)
		monthDate.setMonth(monthDate.getMonth() - i)
		const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
		const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

		const monthSales = sales.filter(sale => {
			const saleDate = new Date(sale.createdAt || sale.date)
			return saleDate >= monthStart && saleDate <= monthEnd
		})

		const monthProfit = monthSales.reduce((sum, sale) => {
			if (sale.items && Array.isArray(sale.items)) {
				return sum + sale.items.reduce((itemSum, item) => itemSum + (item.revenue || 0), 0)
			}
			return sum
		}, 0)

		salesByMonth.push({
			month: monthDate.toLocaleDateString('es-EC', { month: 'short', year: 'numeric' }),
			sales: monthSales.length,
			revenue: monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
			profit: monthProfit,
		})
	}

	return salesByMonth
}

/**
 * Calcula las ventas por día
 */
const calculateSalesByDay = (sales: I_Sale[], endDate: Date, startDate: Date) => {
	const daysToShow = Math.min(7, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
	const salesByDay = []

	for (let i = daysToShow - 1; i >= 0; i--) {
		const date = new Date(endDate)
		date.setDate(date.getDate() - i)
		const dayStart = new Date(date)
		dayStart.setHours(0, 0, 0, 0)
		const dayEnd = new Date(date)
		dayEnd.setHours(23, 59, 59, 999)

		const daySales = sales.filter(sale => {
			const saleDate = new Date(sale.createdAt || sale.date)
			return saleDate >= dayStart && saleDate <= dayEnd
		})

		const dayProfit = daySales.reduce((sum, sale) => {
			if (sale.items && Array.isArray(sale.items)) {
				return sum + sale.items.reduce((itemSum, item) => itemSum + (item.revenue || 0), 0)
			}
			return sum
		}, 0)

		salesByDay.push({
			day: date.toLocaleDateString('es-EC', { weekday: 'short' }),
			date: date.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' }),
			sales: daySales.length,
			revenue: daySales.reduce((sum, sale) => sum + (sale.total || 0), 0),
			profit: dayProfit,
		})
	}

	return salesByDay
}

/**
 * Calcula los top clientes
 */
const calculateTopCustomers = (sales: I_Sale[]) => {
	const customerSales = sales.reduce(
		(acc, sale) => {
			if (sale.customer && sale.customerId) {
				const customerId = sale.customerId
				if (!acc[customerId]) {
					acc[customerId] = {
						customer: sale.customer,
						totalSpent: 0,
						totalProfit: 0,
						salesCount: 0,
					}
				}
				acc[customerId].totalSpent += sale.total || 0
				acc[customerId].salesCount += 1

				if (sale.items && Array.isArray(sale.items)) {
					acc[customerId].totalProfit += sale.items.reduce((sum, item) => sum + (item.revenue || 0), 0)
				}
			}
			return acc
		},
		{} as Record<string, any>
	)

	return Object.values(customerSales)
		.sort((a: any, b: any) => b.totalSpent - a.totalSpent)
		.slice(0, 10)
}

/**
 * Calcula los top productos
 */
const calculateTopProducts = (sales: I_Sale[]) => {
	const productSales = sales.reduce(
		(acc, sale) => {
			if (sale.items && Array.isArray(sale.items)) {
				sale.items.forEach((item: any) => {
					const productId = item.product?.id || item.productId || item.id
					const product = item.product || {}

					if (!acc[productId]) {
						acc[productId] = {
							id: productId,
							name: product.name || item.productName || `Producto ${productId}`,
							code: product.code || item.productCode || '',
							photo: product.photo || null,
							price: product.pricePublic || item.unitPrice || 0,
							totalQuantity: 0,
							totalRevenue: 0,
							totalProfit: 0,
							salesCount: 0,
						}
					}

					acc[productId].totalQuantity += item.quantity || 1
					acc[productId].totalRevenue += item.totalPrice || (item.unitPrice || 0) * (item.quantity || 1)
					acc[productId].totalProfit += item.revenue || 0
					acc[productId].salesCount += 1
				})
			}
			return acc
		},
		{} as Record<string, any>
	)

	return Object.values(productSales)
		.sort((a: any, b: any) => b.totalProfit - a.totalProfit)
		.slice(0, 10)
}
