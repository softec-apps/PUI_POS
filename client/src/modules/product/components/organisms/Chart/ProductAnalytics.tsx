'use client'

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

// Registrar componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Datos simulados
const generateSalesData = () => {
	const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
	return {
		labels: days,
		datasets: [
			{
				label: 'Ventas actuales',
				data: days.map(() => Math.floor(Math.random() * 100) + 20),
				borderColor: '#427b58',
				backgroundColor: 'rgba(66, 123, 88, 0.2)',
				tension: 0.4,
				fill: true,
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 4,
				pointBackgroundColor: '#427b58',
				pointBorderColor: '#427b58',
				pointBorderWidth: 2,
			},
			{
				label: 'Período anterior',
				data: days.map(() => Math.floor(Math.random() * 80) + 10),
				borderColor: '#fe8019',
				backgroundColor: 'rgba(254, 128, 25, 0.2)',
				tension: 0.4,
				fill: true,
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 4,
				pointBackgroundColor: '#fe8019',
				pointBorderColor: '#fe8019',
				pointBorderWidth: 2,
			},
		],
	}
}

export function ProductAnalytics() {
	const salesData = generateSalesData()
	const salesOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				mode: 'index' as const,
				intersect: false,
				backgroundColor: 'rgba(0, 0, 0, 0.6)',
				titleColor: '#ffffff',
				bodyColor: '#ffffff',
				borderColor: 'rgba(255, 255, 255, 0.5)',
				borderWidth: 1,
				cornerRadius: 12,
				displayColors: true,
			},
		},
		scales: {
			x: {
				display: true,
				grid: {
					display: false,
				},
				border: {
					display: false,
				},
				ticks: {
					color: '#6b7280',
					font: {
						size: 12,
						weight: '500',
					},
					padding: 0,
				},
			},
			y: {
				display: false,
				grid: {
					display: false,
				},
			},
		},
		elements: {
			point: {
				hoverBorderWidth: 2,
			},
		},
		interaction: {
			intersect: false,
			mode: 'index',
		},
		layout: {
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
		},
	}

	return (
		<div className='space-y-6'>
			{/* Ventas del Producto */}
			<Card className='border-border/50 bg-accent/20 rounded-2xl border-none'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<CardTitle>Ventas del Producto</CardTitle>
						</div>
						<Badge decord={false} variant='success' text='+20%' />
					</div>
					<CardDescription>Últimos 7 días</CardDescription>
				</CardHeader>

				<CardContent>
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-3 rounded-full bg-[#427b58]'></div>
								<span className='text-muted-foreground text-sm'>Ventas totales</span>
							</div>
							<span className='text-foreground/90 font-medium'>142 unidades</span>
						</div>

						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-3 rounded-full bg-orange-500'></div>
								<span className='text-muted-foreground text-sm'>Período anterior</span>
							</div>
							<span className='text-muted-foreground'>118 unidades</span>
						</div>
					</div>

					<div className='relative h-48 w-full pt-4'>
						<Line options={salesOptions} data={salesData} style={{ width: '100%' }} />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
