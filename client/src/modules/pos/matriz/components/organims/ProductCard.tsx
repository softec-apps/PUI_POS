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
import { formatPrice } from '@/common/utils/formatPrice-util'

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

interface ProductCardProps {
	product: I_Product
	onAddToCart: (product: I_Product) => void
	onSelect?: () => void
	disabled?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onSelect, disabled }) => {
	const [openDetail, setProductDetailOpen] = useState(false)

	// Verificar primero el status y luego el stock
	const isValidStatus = product.status === 'active'
	const isOutOfStock = product.stock === 0
	const isDisabled = disabled || !isValidStatus || isOutOfStock

	const handleCardClick = () => {
		if (isDisabled) return
		if (onSelect) onSelect()
		onAddToCart(product)
	}

	// Determinar el texto y color del badge basado en status y stock
	const getStatusBadgeInfo = () => {
		// Primero verificar el status
		switch (product.status) {
			case 'draft':
				return { text: 'Borrador', color: 'bg-sky-500' }
			case 'inactive':
				return { text: 'Inactivo', color: 'bg-red-500' }
			case 'discontinued':
				return { text: 'Descontinuado', color: 'bg-orange-500' }
			case 'out_of_stock':
				return { text: 'Agotado', color: 'bg-yellow-500' }
			case 'active':
				// Si el status es active, verificar el stock
				if (product.stock === 0) {
					return { text: 'Agotado', color: 'bg-destructive' }
				} else if (product.stock === 1) {
					return { text: '1 und', color: 'bg-orange-500' }
				} else if (product.stock <= 5) {
					return { text: `${product.stock} und`, color: 'bg-yellow-500 dark:bg-yellow-400' }
				}
			default:
				return { text: `${product.stock} und`, color: 'bg-muted-foreground' }
		}
	}

	const badgeInfo = getStatusBadgeInfo()

	return (
		<>
			<motion.div
				variants={itemVariants}
				whileHover={{ scale: isDisabled ? 1 : 1.02 }}
				whileTap={{ scale: isDisabled ? 1 : 0.98 }}>
				<Card
					className={cn(
						'cursor-pointer border-2 p-0 transition-all duration-500 select-none',
						'group relative overflow-hidden',
						isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/50 hover:shadow-md'
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
									className='h-full w-full object-contain'
								/>
							) : (
								<Icons.media className='text-muted-foreground h-8 w-8' />
							)}

							{/* Status/Stock badge */}
							<div className='absolute bottom-2 left-2'>
								<div className={`text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium ${badgeInfo.color}`}>
									{badgeInfo.text}
								</div>
							</div>
						</div>

						{/* Información del producto */}
						<div className='space-y-1 p-2'>
							{/* Code del producto */}
							<Typography variant='small' className='text-muted-foreground line-clamp-1 font-mono text-xs break-words'>
								{product.barCode || '-'}
							</Typography>

							{/* Nombre del producto */}
							<Typography
								variant='small'
								className='text-primary line-clamp-3 h-[50px] overflow-hidden text-xs break-words tabular-nums'>
								{product.name}
							</Typography>

							{/* Precio */}
							<Typography variant='overline' className='text-primary/90 font-mono text-sm'>
								${formatPrice(product.pricePublic)}
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
							<div className='bg-muted relative flex aspect-square h-24 w-full items-center justify-center'>
								{/* Action buttons skeleton */}
								<div className='absolute bottom-2 left-2 flex gap-1'>
									<Skeleton className='h-5 w-16 rounded-full' />
								</div>
							</div>

							{/* Content skeleton */}
							<div className='space-y-2 p-3'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</>
	)
}
