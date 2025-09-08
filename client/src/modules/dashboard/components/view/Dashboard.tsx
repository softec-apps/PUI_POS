'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/common/hooks/useAuth'
import { useSale } from '@/common/hooks/useSale'
import { formatPrice } from '@/common/utils/formatPrice-util'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	Filler,
} from 'chart.js'

// Componentes del dashboard
import { KPISection } from '@/modules/dashboard/components/templates/KPISection'
import { TimeSelector } from '@/modules/dashboard/components/organisms/TimeSelector'
import { ChartsSection } from '@/modules/dashboard/components/templates/ChartsSection'
import { DashboardHeader } from '@/modules/dashboard/components/templates/DashboardHeader'
import { ProfitabilitySection } from '@/modules/dashboard/components/templates/ProfitabilitySection'
import { TopCustomersSection, TopProductsSection } from '@/modules/dashboard/components/templates/TopPerformersSection'

// Utilidades y hooks
import { useDashboardMetrics } from '@/modules/dashboard/hooks/useDashboardMetrics'
import { getEcuadorTime, getGreeting } from '@/modules/dashboard/utils/timeUtils'
import { getPeriodDates } from '@/modules/dashboard/utils/dateUtils'

// Registrar Chart.js
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	Filler
)

export function DashboardView() {
	const { user } = useAuth()
	const [currentTime, setCurrentTime] = useState(getEcuadorTime())
	const [dateRange, setDateRange] = useState<string>('30')

	// Filtros para el hook de ventas
	const filters = useMemo(() => {
		if (dateRange === '0') return {}
		const { startDate, endDate } = getPeriodDates(dateRange)
		return {
			createdAt: {
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			},
		}
	}, [dateRange])

	const { recordsData, loading } = useSale({
		limit: 9999, // API reconce que no debe usar paginacion
		filters,
	})

	// Calcular métricas
	const metrics = useDashboardMetrics(recordsData?.data?.items || [], dateRange)

	// Datos para gráficos
	const chartData = useMemo(() => {
		const dailySalesData = {
			labels: metrics.salesByDay.map(item => `${item.day}\n${item.date}`),
			datasets: [
				{
					label: 'Ventas del día',
					data: metrics.salesByDay.map(item => item.sales),
					backgroundColor: 'rgba(116, 134, 119, 0.8)',
					borderColor: 'rgb(116, 134, 119)',
					borderWidth: 0,
				},
			],
		}

		const salesTrendData = {
			labels: metrics.salesByMonth.map(item => item.month),
			datasets: [
				{
					label: 'Número de Ventas',
					data: metrics.salesByMonth.map(item => item.sales),
					borderColor: 'rgb(75, 192, 192)',
					backgroundColor: 'rgba(75, 192, 192, 0.1)',
					tension: 0.4,
					fill: true,
					yAxisID: 'y',
				},
				{
					label: 'Ingresos ($)',
					data: metrics.salesByMonth.map(item => item.revenue),
					borderColor: 'rgb(159, 213, 190)',
					backgroundColor: 'rgba(159, 213, 190, 0.1)',
					tension: 0.4,
					fill: false,
					yAxisID: 'y1',
				},
				{
					label: 'Ganancias ($)',
					data: metrics.salesByMonth.map(item => item.profit),
					borderColor: 'rgb(206, 180, 217)',
					backgroundColor: 'rgba(206, 180, 217, 0.1)',
					tension: 0.4,
					fill: false,
					yAxisID: 'y1',
				},
			],
		}

		const paymentMethodData = {
			labels: Object.keys(metrics.salesByPaymentMethod),
			datasets: [
				{
					data: Object.values(metrics.salesByPaymentMethod),
					backgroundColor: ['#fbdee0', '#a6c7ea', '#fbf5ab', '#4BC0C0', '#dfcde3', '#e6eda0'],
					borderWidth: 0,
				},
			],
		}

		const statusSriData = {
			labels: Object.keys(metrics.salesByStatus).map(status => {
				switch (status) {
					case 'AUTHORIZED':
						return 'Autorizadas'
					case 'PENDING':
						return 'Pendientes'
					case 'NO_ELECTRONIC':
						return 'No Electrónicas'
					case 'ERROR':
						return 'Error'
					default:
						return status
				}
			}),
			datasets: [
				{
					data: Object.values(metrics.salesByStatus),
					backgroundColor: ['#9fd4bd', '#f1afa1', '#f6f19f', '#ccd7c6'],
					borderWidth: 0,
				},
			],
		}

		return {
			dailySalesData,
			salesTrendData,
			paymentMethodData,
			statusSriData,
		}
	}, [metrics])

	// Opciones para gráficos
	const chartOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					mode: 'index' as const,
					intersect: false,
					backgroundColor: 'rgba(0, 0, 0, 0.8)',
					titleColor: '#ffffff',
					bodyColor: '#ffffff',
					borderColor: 'rgba(255, 255, 255, 0.3)',
					borderWidth: 1,
					cornerRadius: 8,
					displayColors: true,
				},
			},
			scales: {
				x: {
					display: true,
					grid: { display: false },
					border: { display: false },
					ticks: {
						font: { size: 11, weight: '500' },
						padding: 0,
					},
				},
				y: {
					display: false,
					grid: { display: false },
				},
			},
			elements: {
				point: { hoverBorderWidth: 2 },
			},
			interaction: {
				intersect: false,
				mode: 'index',
			},
			layout: {
				padding: { left: 0, right: 0, top: 0, bottom: 0 },
			},
		}),
		[]
	)

	const paymentMethodOptions = useMemo(
		() => ({
			...chartOptions,
			plugins: {
				...chartOptions.plugins,
				tooltip: {
					...chartOptions.plugins.tooltip,
					callbacks: {
						label: function (context: any) {
							const label = context.label || ''
							const value = context.raw || 0
							return `${label}: ${formatPrice(value)}`
						},
					},
				},
			},
		}),
		[chartOptions]
	)

	useEffect(() => {
		const interval = setInterval(() => setCurrentTime(getEcuadorTime()), 1000)
		return () => clearInterval(interval)
	}, [])

	// Datos del usuario y saludo
	const firstName = user?.firstName || ''
	const lastName = user?.lastName || ''
	const fullName = `${firstName} ${lastName}`.trim() || 'Usuario'
	const ecuadorHour = currentTime.getHours()
	const greeting = getGreeting(ecuadorHour)

	return (
		<div className='flex flex-1 flex-col gap-6'>
			<div className='items-center justify-between gap-4 md:flex'>
				<DashboardHeader greeting={greeting} userName={fullName} />
				<div className='pt-6 md:pt-0'>
					<TimeSelector currentTime={currentTime} dateRange={dateRange} onDateRangeChange={setDateRange} />
				</div>
			</div>

			<div className='grid grid-cols-5 gap-6'>
				<div className='col-span-5 flex flex-col gap-4 md:col-span-3'>
					<KPISection metrics={metrics} dateRange={dateRange} loading={loading} />
					<ProfitabilitySection metrics={metrics} loading={loading} />
					<div className='pt-2'>
						<TopCustomersSection metrics={metrics} />
					</div>
				</div>

				<div className='col-span-2'>
					<TopProductsSection metrics={metrics} />
				</div>
			</div>

			<ChartsSection
				metrics={metrics}
				dailySalesData={chartData.dailySalesData}
				statusSriData={chartData.statusSriData}
				paymentMethodData={chartData.paymentMethodData}
				salesTrendData={chartData.salesTrendData}
				chartOptions={chartOptions}
				paymentMethodOptions={paymentMethodOptions}
			/>
		</div>
	)
}
