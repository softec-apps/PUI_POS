'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { I_Product } from '@/common/types/modules/product'
import { ProductDetailDialog } from './ProductDetailDialog'

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

interface ProductCardProps {
	product: I_Product
	onAddToCart: (product: I_Product) => void
	isSelected?: boolean
	onSelect?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isSelected = false, onSelect }) => {
	const [openDetail, setProductDetailOpen] = useState(false)

	const isOutOfStock = product.stock === 0

	const handleCardClick = e => {
		// Prevenir que el click en botones active la selección
		if (e.target.closest('button')) return

		if (onSelect) onSelect()

		if (!isOutOfStock) onAddToCart(product)
	}

	return (
		<>
			<motion.div
				variants={itemVariants}
				whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
				whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}>
				<Card
					className={cn(
						'cursor-pointer border-2 p-0 transition-all duration-200 select-none',
						'group relative overflow-hidden',

						isOutOfStock ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/50 hover:shadow-md active:scale-95'
					)}
					onClick={handleCardClick}>
					<CardContent className='p-0'>
						{/* Imagen del producto */}
						<div className='bg-muted relative flex aspect-video w-full items-center justify-center overflow-hidden'>
							{product.photo ? (
								<Image
									src={product.photo.path}
									alt={product.name}
									width={200}
									height={200}
									unoptimized
									className='h-full w-full object-cover transition-transform group-hover:scale-105'
								/>
							) : (
								<Icons.media className='text-muted-foreground h-8 w-8' />
							)}

							{/* Indicador de agotado */}
							{isOutOfStock && (
								<div className='absolute inset-0 flex items-center justify-center bg-black/60'>
									<div className='bg-destructive text-primary-foreground rounded-full px-3 py-1 text-sm font-medium'>
										AGOTADO
									</div>
								</div>
							)}

							{/* Stock badge */}
							{!isOutOfStock && (
								<div className='absolute top-2 left-2'>
									<div className='text-primary-foreground rounded-full bg-indigo-400 px-2 py-0.5 text-xs font-medium'>
										{`${product.stock} und`}
									</div>
								</div>
							)}
						</div>

						{/* Información del producto */}
						<div className='space-y-2 p-3'>
							{/* Nombre del producto */}
							<Typography variant='small' className='line-clamp-1 text-xs break-words'>
								{product.name}
							</Typography>

							{/* Código del producto */}
							<Typography variant='small' className='text-muted-foreground line-clamp-1 text-xs break-words'>
								{product.code}
							</Typography>

							{/* Precio */}
							<Typography variant='overline' className='text-primary/90 text-sm'>
								${product.price.toFixed(2)}
							</Typography>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Product Detail Dialog */}
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

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 8 }) => {
	return (
		<>
			{Array.from({ length: count }).map((_, i) => (
				<motion.div
					key={`product-skeleton-${i}`}
					variants={itemVariants}
					initial='hidden'
					animate='visible'
					transition={{ delay: i * 0.05 }}>
					<Card className='overflow-hidden border-2 p-0 shadow-none'>
						<CardContent className='p-0'>
							{/* Image skeleton */}
							<div className='bg-muted relative flex aspect-square w-full items-center justify-center'>
								<Skeleton className='h-full w-full' />

								{/* Action buttons skeleton */}
								<div className='absolute top-2 right-2 flex gap-1'>
									<Skeleton className='h-6 w-6 rounded-full' />
									<Skeleton className='h-6 w-6 rounded-full' />
								</div>
							</div>

							{/* Content skeleton */}
							<div className='space-y-2 p-3'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
								<Skeleton className='mx-auto h-4 w-16 rounded' />
								<Skeleton className='mx-auto h-5 w-20' />
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</>
	)
}
