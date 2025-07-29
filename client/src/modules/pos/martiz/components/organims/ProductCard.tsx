'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { I_Product } from '@/modules/product/types/product'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
	DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/layout/atoms/Badge'

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
	const [open, setOpen] = useState(false)

	return (
		<>
			<motion.div variants={itemVariants} {...(isTouch ? {} : { whileHover: { scale: 1 }, whileTap: { scale: 0.9 } })}>
				<Card className='hover:border-primary/50 cursor-pointer p-0 transition-all duration-500'>
					<CardContent className='space-y-2 p-0 lg:space-y-3'>
						<div className='bg-muted flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-xl'>
							{product.photo ? (
								<Image
									src={product.photo.path}
									alt={product.name}
									width={400}
									height={300}
									className='h-full w-full object-cover'
								/>
							) : (
								<Icons.media className='text-muted-foreground h-8 w-8' />
							)}
						</div>

						<div className='flex flex-col items-start gap-4 p-4'>
							<div className='flex w-full items-center justify-between gap-4'>
								<ProductStatusBadge status={product.status} />
								<Badge text={`${product.stock} ud`} />
							</div>
							<div className='min-w-0 flex-1'>
								<h3 className='truncate text-xs font-semibold lg:text-sm'>{product.name}</h3>
								<p className='text-primary text-sm font-bold lg:text-lg'>${product.price.toFixed(2)}</p>
							</div>
						</div>
					</CardContent>

					<div className='flex flex-col gap-4 p-4'>
						<ActionButton
							onClick={() => onAddToCart(product)}
							size='lg'
							text='Agregar'
							className='w-full'
							icon={<Icons.plus className='mr-1 h-3 w-3' />}
						/>
						<Button size='lg' variant='ghost' onClick={() => setOpen(true)} className='w-full'>
							Detalles
						</Button>
					</div>
				</Card>
			</motion.div>

			{/* Modal Detalles */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='max-w-lg'>
					<DialogHeader>
						<DialogTitle>{product.name}</DialogTitle>
						<DialogDescription>{product.description ?? 'Sin descripción disponible.'}</DialogDescription>
					</DialogHeader>

					{product.photo && (
						<div className='my-4 w-full overflow-hidden rounded-md'>
							<Image
								src={product.photo.path}
								alt={product.name}
								width={600}
								height={400}
								className='w-full object-cover'
							/>
						</div>
					)}

					<div className='space-y-2 text-sm'>
						<p>
							<strong>Precio:</strong> ${product.price.toFixed(2)}
						</p>
						<p>
							<strong>Stock:</strong> {product.stock}
						</p>
						<p>
							<strong>Categoría:</strong> {product.category?.name ?? 'N/A'}
						</p>
						<p>
							<strong>Marca:</strong> {product.brand?.name ?? 'N/A'}
						</p>
						<p>
							<strong>Estado:</strong> {product.status}
						</p>
						<p>
							<strong>Código:</strong> {product.code}
						</p>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Cerrar</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
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
