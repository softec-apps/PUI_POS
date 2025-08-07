'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { I_Product } from '@/common/types/modules/product'
import { ProductDetailDialog } from './ProductDetailDialog'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

interface ProductCardProps {
	product: I_Product
	onAddToCart: (product: I_Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
	const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window
	const [openDetail, setProductDetailOpen] = useState(false)

	return (
		<>
			<motion.div variants={itemVariants} {...(isTouch ? {} : { whileHover: { scale: 1 }, whileTap: { scale: 1 } })}>
				<Card className='border-noned p-0 shadow-none transition-all duration-500'>
					<CardContent className='space-y-2 p-0 lg:space-y-3'>
						<div className='bg-muted flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-xl'>
							{product.photo ? (
								<Image
									src={product.photo.path}
									alt={product.name}
									width={400}
									height={300}
									unoptimized
									className='h-full w-full object-contain'
								/>
							) : (
								<Icons.media className='text-muted-foreground h-8 w-8' />
							)}
						</div>

						<div className='flex flex-col items-start gap-4 px-4'>
							<div className='flex w-full items-center justify-between gap-4'>
								<ProductStatusBadge status={product.status} />
								<Badge text={`${product.stock} ud`} />
							</div>

							<Typography variant='h5' className='line-clamp-1 break-words'>
								{product.name}
							</Typography>

							<Typography variant='overline' className='line-clamp-1 flex items-center gap-2 break-words'>
								{product.code}
							</Typography>

							<Typography variant='overline' className='line-clamp-1 break-words'>
								${product.price.toFixed(2)} USD
							</Typography>
						</div>
					</CardContent>

					<div className='flex justify-between gap-2 px-4 pb-4'>
						<ActionButton
							onClick={() => setProductDetailOpen(true)}
							size='pos'
							variant='secondary'
							tooltip='Detalles'
							icon={<Icons.infoCircle />}
						/>

						<ActionButton onClick={() => onAddToCart(product)} size='pos' tooltip='Agregar' icon={<Icons.plus />} />
					</div>
				</Card>
			</motion.div>

			{/* Diálogo de Detalles */}
			<ProductDetailDialog
				productId={product.id}
				isOpen={openDetail}
				onClose={() => setProductDetailOpen(false)}
				onAddToCart={onAddToCart}
			/>
		</>
	)
}

interface ProductCardSkeletonProps {
	count?: number
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 5 }) => {
	return (
		<>
			{Array.from({ length: count }).map((_, i) => (
				<motion.div
					key={`skeleton-${i}`}
					variants={itemVariants}
					initial='hidden'
					animate='visible'
					className='cursor-default p-0 transition-all duration-500'>
					<Card className='p-0'>
						<CardContent className='space-y-2 p-0 lg:space-y-3'>
							<div className='bg-muted flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-xl'>
								<Skeleton className='h-full w-full rounded-t-xl' />
							</div>

							<div className='flex items-start p-4'>
								<div className='min-w-0 flex-1 space-y-2'>
									<Skeleton className='h-4 w-3/4 rounded' />
									<Skeleton className='h-5 w-1/4 rounded' />
								</div>
							</div>

							<div className='mx-4 mb-4'>
								<Skeleton className='h-5 w-1/3 rounded' />
							</div>
						</CardContent>

						<div className='flex flex-col gap-4 p-4'>
							<Skeleton className='h-9 w-full rounded' />
							<Skeleton className='h-9 w-full rounded' />
						</div>
					</Card>
				</motion.div>
			))}
		</>
	)
}
