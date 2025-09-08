// types/dashboard.ts
export interface DashboardMetrics {
	totalRevenue: number
	totalGrossProfit: number
	profitMargin: number
	uniqueCustomers: number
	totalSales: number
	averageTicket: number
	totalItems: number
	totalTaxes: number
	totalDiscounts: number
	electronicInvoices: number
	pendingInvoices: number
	noElectronicInvoices: number
	electronicInvoicePercentage: number
	revenueGrowth: number
	profitGrowth: number
	salesGrowth: number
	customersGrowth: number
	ticketGrowth: number
	salesByPaymentMethod: Record<string, number>
	salesByMonth: Array<{
		month: string
		sales: number
		revenue: number
		profit: number
	}>
	topCustomers: Array<{
		customer: { id: string; firstName: string; lastName: string }
		totalSpent: number
		salesCount: number
		totalProfit: number
	}>
	topProducts: Array<{
		id: string
		name: string
		photo?: { path: string }
		totalQuantity: number
		totalProfit: number
		totalRevenue: number
	}>
	salesByDay: Array<{
		day: string
		date: string
		sales: number
		revenue: number
		profit: number
	}>
	salesByStatus: Record<string, number>
}
