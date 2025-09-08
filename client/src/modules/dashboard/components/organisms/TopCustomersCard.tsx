'use client'
import React from 'react'
import { Icons } from '@/components/icons'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface TopCustomersCardProps {
	customers: DashboardMetrics['topCustomers']
}

export const TopCustomersCard: React.FC<TopCustomersCardProps> = ({ customers }) => {
	const getRankIcon = (index: number) => {
		const icons = [
			<Icons.trophy className='h-4 w-4 text-yellow-500' />, // Oro
			<Icons.trophy className='h-4 w-4 text-gray-400' />, // Plata
			<Icons.trophy className='h-4 w-4 text-amber-600' />, // Bronce
		]
		return icons[index] || <span className='text-muted-foreground text-xs font-medium'>#{index + 1}</span>
	}

	return (
		<Card className='w-full border-none bg-transparent p-0'>
			<CardHeader className='p-0'>
				<CardTitle className='text-lg font-semibold'>Top 3 Clientes</CardTitle>
				<CardDescription>Clientes con mayor volumen de compras</CardDescription>
			</CardHeader>
			<CardContent className='p-0'>
				{customers?.length > 0 ? (
					<div className='flex w-full gap-4'>
						{customers.slice(0, 3).map((customer, index) => (
							<div
								key={`customer-${customer.customer?.id || index}`}
								className='border-border/50 bg-muted/50 dark:bg-popover flex flex-1 items-center gap-4 rounded-2xl border p-4'>
								<div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
									{getRankIcon(index)}
								</div>
								<div className='flex-1'>
									<p className='mb-1 truncate text-sm font-medium'>
										{customer.customer?.firstName} {customer.customer?.lastName}
									</p>
									<div className='flex items-center justify-between'>
										<p className='text-muted-foreground text-xs'>
											{customer.salesCount} compra{customer.salesCount !== 1 ? 's' : ''}
										</p>
										<p className='text-sm font-semibold tabular-nums'>${formatPrice(customer.totalSpent)}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='border-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center'>
						<Icons.user className='text-muted-foreground/60 mb-2 h-8 w-8' />
						<p className='text-muted-foreground text-sm'>No hay clientes en este período</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
