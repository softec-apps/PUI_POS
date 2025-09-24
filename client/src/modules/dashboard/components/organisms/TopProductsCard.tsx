'use client'

import React from 'react'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface TopProductsCardProps {
	products: DashboardMetrics['topProducts']
}

export const TopProductsCard: React.FC<TopProductsCardProps> = ({ products }) => {
	return (
		<Card className='w-full min-w-full border-none bg-transparent p-0'>
			<CardHeader className='p-0'>
				<CardTitle>Top 6 productos más rentables</CardTitle>
				<CardDescription>Productos ordenados por ganancia total</CardDescription>
			</CardHeader>
			<CardContent className='p-0'>
				<div className='dark:bg-popover bg-muted/50 border-border/50 w-full rounded-2xl border'>
					{products?.length > 0 ? (
						products?.slice(0, 6)?.map((product, index) => (
							<div key={`product-${product?.id}-${index}`} className='flex items-center gap-3 p-3'>
								<ImageControl
									imageUrl={product?.photo?.path}
									altText={product?.name}
									enableClick={false}
									enableHover={false}
									imageHeight={30}
									imageWidth={40}
								/>
								<div className='w-full'>
									<Typography variant='small' className='text-primary max-w-xs truncate text-xs'>
										{product?.name}
									</Typography>
									<div className='flex items-center justify-between'>
										<p className='text-muted-foreground text-xs tabular-nums'>
											{product?.totalQuantity} {product?.totalQuantity === 1 ? 'unidad vendida' : 'unidades vendidas'}
										</p>

										<span className='text-xs font-medium text-emerald-600 tabular-nums'>
											Ganancia: ${formatPrice(product?.totalProfit)}
										</span>
									</div>
								</div>
							</div>
						))
					) : (
						<div className='text-muted-foreground py-8 text-center'>
							<Icons.shoppingBag className='mx-auto mb-2 h-12 w-12 opacity-50' />
							<p className='text-sm'>No hay productos en este período</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
