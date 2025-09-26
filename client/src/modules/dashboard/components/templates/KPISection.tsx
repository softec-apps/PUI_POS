'use client'

import React from 'react'
import { KPICard } from '@/components/layout/organims/KPICard'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'

interface KPISectionProps {
	metrics: DashboardMetrics
	dateRange: string
	loading: boolean
}

// Función de comparación personalizada para evitar rerenders innecesarios
const arePropsEqual = (prevProps: KPISectionProps, nextProps: KPISectionProps) => {
	return (
		prevProps.loading === nextProps.loading &&
		prevProps.dateRange === nextProps.dateRange &&
		prevProps.metrics.totalRevenue === nextProps.metrics.totalRevenue &&
		prevProps.metrics.totalGrossProfit === nextProps.metrics.totalGrossProfit &&
		prevProps.metrics.totalSales === nextProps.metrics.totalSales
	)
}

export const KPISection: React.FC<KPISectionProps> = React.memo(({ metrics, dateRange, loading }) => {
	const showGrowth = dateRange !== '0'

	return (
		<section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
			<KPICard
				title='Ventas'
				value={metrics.totalSales}
				//growth={showGrowth ? metrics.salesGrowth : undefined}
				description='Cantidad total de ventas realizadas'
				isLoading={loading}
			/>

			<KPICard
				title='Ingresos'
				value={metrics.totalRevenue}
				//growth={showGrowth ? metrics.revenueGrowth : undefined}
				isCurrency
				description='Monto total generado por las ventas'
				isLoading={loading}
			/>

			<KPICard
				title='Ganancias'
				value={metrics.totalGrossProfit}
				//growth={showGrowth ? metrics.profitGrowth : undefined}
				isCurrency
				description='Beneficio neto después de costos'
				isLoading={loading}
			/>
		</section>
	)
}, arePropsEqual)

KPISection.displayName = 'KPISection'
