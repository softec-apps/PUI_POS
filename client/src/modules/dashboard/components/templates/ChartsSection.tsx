'use client'

import React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface ChartsSectionProps {
	metrics: DashboardMetrics
	dailySalesData: any
	statusSriData: any
	paymentMethodData: any
	salesTrendData: any
	chartOptions: any
	paymentMethodOptions: any
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
	metrics,
	dailySalesData,
	statusSriData,
	paymentMethodData,
	salesTrendData,
	chartOptions,
	paymentMethodOptions,
}) => {
	return (
		<>
			{/* Primera fila de gráficos */}
			<section className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
				<Card className='border-border/50 lg:col-span-2'>
					<CardHeader>
						<CardTitle>Ventas por día</CardTitle>
						<CardDescription>Últimos {metrics?.salesByDay?.length} días del período seleccionado</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='h-64'>
							<Bar data={dailySalesData} options={chartOptions} />
						</div>
					</CardContent>
				</Card>

				<Card className='border-border/50'>
					<CardHeader>
						<CardTitle>Estado SRI</CardTitle>
						<CardDescription>Distribución por estado de autorización</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='h-64'>
							<Doughnut data={statusSriData} options={chartOptions} />
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Segunda fila de gráficos */}
			<section className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
				<Card className='border-border/50'>
					<CardHeader>
						<CardTitle>Métodos de pago</CardTitle>
						<CardDescription>Distribución de ingresos por método</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='h-64'>
							<Doughnut data={paymentMethodData} options={paymentMethodOptions} />
						</div>
					</CardContent>
				</Card>

				<Card className='border-border/50 lg:col-span-2'>
					<CardHeader>
						<CardTitle>Tendencia mensual</CardTitle>
						<CardDescription>Evolución de ventas, ingresos y ganancias</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='h-64'>
							<Line data={salesTrendData} options={chartOptions} />
						</div>
					</CardContent>
				</Card>
			</section>
		</>
	)
}
