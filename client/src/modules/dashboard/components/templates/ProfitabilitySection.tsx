'use client'

import React from 'react'
import { KPICard } from '@/components/layout/organims/KPICard'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'

interface ProfitabilitySectionProps {
	metrics: DashboardMetrics
	loading: boolean
}

// Función de comparación personalizada para React.memo
const arePropsEqual = (prevProps: ProfitabilitySectionProps, nextProps: ProfitabilitySectionProps) => {
	return (
		prevProps.loading === nextProps.loading &&
		prevProps.metrics.profitMargin === nextProps.metrics.profitMargin &&
		prevProps.metrics.totalGrossProfit === nextProps.metrics.totalGrossProfit &&
		prevProps.metrics.totalSales === nextProps.metrics.totalSales
	)
}

export const ProfitabilitySection: React.FC<ProfitabilitySectionProps> = React.memo(({ metrics, loading }) => {
	const getAverageProfit = () => {
		return metrics.totalSales > 0 ? metrics.totalGrossProfit / metrics.totalSales : 0
	}

	return (
		<section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2'>
			<KPICard
				title='Margen de ganancia'
				value={metrics.profitMargin.toFixed(1)}
				description='Ganancia sobre ingresos totales'
				isLoading={loading}
				isCurrency
			/>

			<KPICard
				title='Ganancia promedio'
				value={getAverageProfit()}
				isCurrency
				description='Ganancia promedio por venta'
				isLoading={loading}
			/>
		</section>
	)
}, arePropsEqual)

ProfitabilitySection.displayName = 'ProfitabilitySection'
