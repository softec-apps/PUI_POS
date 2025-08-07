'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'
import { useProduct } from '@/common/hooks/useProduct'
import { I_Product, I_IdProduct } from '@/common/types/modules/product'
import { Card, CardContent } from '@/components/ui/card'
import { ProductImage } from '../molecules/ProductImage'
import { InfoCard } from './InfoCard'

interface ProductDetailDialogProps {
	productId: I_IdProduct
	isOpen: boolean
	onClose: () => void
	onAddToCart: (product: I_Product) => void
}

interface ProductDetailSectionProps {
	title: string
	children: React.ReactNode
	icon?: React.ReactNode
}

const ProductDetailSection: React.FC<ProductDetailSectionProps> = ({ title, children, icon }) => (
	<Card className='border-none bg-transparent p-0 shadow-none'>
		<CardContent className='p-4'>
			<div className='mb-3 flex items-center gap-2'>
				{icon}
				<Typography variant='span'>{title}</Typography>
			</div>
			{children}
		</CardContent>
	</Card>
)

const DetailItem: React.FC<{ label: string; value: string | number | null | React.ReactNode; fallback?: string }> = ({
	label,
	value,
	fallback = 'N/A',
}) => (
	<div className='flex items-center justify-between py-1'>
		<Typography variant='small'>{label}</Typography>
		<Typography variant='span' className='font-medium'>
			{value ?? fallback}
		</Typography>
	</div>
)

export const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
	productId,
	isOpen,
	onClose,
	onAddToCart,
}) => {
	const { getProductById } = useProduct()
	const [product, setProduct] = useState<I_Product | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadProductData = async () => {
		if (!productId || !isOpen) return
		setLoading(true)
		setError(null)
		try {
			const productData = await getProductById(productId)
			setProduct(productData)
		} catch (err) {
			console.error('Error al cargar el producto:', err)
			setError('Error al cargar los detalles del producto')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (isOpen && productId) {
			loadProductData()
		}
	}, [isOpen, productId])

	const handleClose = () => {
		setProduct(null)
		setError(null)
		onClose()
	}

	const handleAddToCart = () => {
		if (product) onAddToCart(product)
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-h-[90vh] w-full min-w-5xl rounded-2xl border-none p-0'>
				<div className='flex h-[90vh] flex-col'>
					{/* Header fijo */}
					<DialogHeader className='flex-shrink-0 border-b px-6 pt-6 pb-4'>
						<div className='flex items-start justify-between gap-4'>
							<div className='flex-1 space-y-2'>
								<DialogTitle className='text-xl leading-tight font-semibold'>
									{loading ? <Skeleton className='h-6 w-64 rounded-md' /> : product?.name || 'Cargando...'}
								</DialogTitle>
								<DialogDescription className='text-muted-foreground text-sm'>
									{loading ? (
										<Skeleton className='h-4 w-48 rounded-md' />
									) : (
										product?.description || 'Sin descripción disponible'
									)}
								</DialogDescription>
							</div>
							<DialogClose className='flex-shrink-0'>
								<ActionButton variant='ghost' size='pos' icon={<Icons.x />} />
							</DialogClose>
						</div>
					</DialogHeader>

					{/* Contenido con scroll */}
					<ScrollArea className='flex-1 overflow-auto px-6'>
						<div className='py-6'>
							<AnimatePresence mode='wait'>
								{loading ? (
									<ProductDetailSkeleton />
								) : error ? (
									<ProductDetailError key='error' error={error} onRetry={loadProductData} />
								) : product ? (
									<ProductDetailContent key='content' product={product} />
								) : null}
							</AnimatePresence>
						</div>
					</ScrollArea>

					{/* Footer fijo */}
					{product && !loading && !error && (
						<div className='bg-background flex-shrink-0 rounded-b-2xl px-6 py-4'>
							<ActionButton
								onClick={handleAddToCart}
								size='pos'
								text='Agregar al carrito'
								className='w-full'
								icon={<Icons.shoppingCart className='h-4 w-4' />}
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

interface ProductDetailContentProps {
	product: I_Product
}

const ProductDetailContent: React.FC<ProductDetailContentProps> = ({ product }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		exit={{ opacity: 0, y: -20 }}
		transition={{ duration: 0.3 }}>
		<div className='space-y-6'>
			<div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
				{/* Imagen o fallback */}
				<motion.div
					initial={{ opacity: 0, scale: 1 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1 }}
					className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					<ProductImage
						recordData={product}
						enableHover={false}
						enableClick={false}
						quality={10}
						imageHeight={300}
						imageWidth={450}
					/>
				</motion.div>

				{/* Información básica */}
				<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
					<ProductDetailSection
						title='Información general'
						icon={<Icons.infoCircle className='text-muted-foreground h-4 w-4' />}>
						<div className='space-y-1'>
							<DetailItem label='Código' value={product.code} />
							<DetailItem label='SKU' value={product.sku} />
							<DetailItem label='Código de Barras' value={product.barCode} />
							<DetailItem label='Variante' value={product.isVariant ? 'Sí' : 'No'} />
							<DetailItem label='Stock' value={product.stock} />
							<DetailItem label='Estado' value={<ProductStatusBadge status={product.status} />} />
							<DetailItem label='Precio' value={`$ ${product.price.toFixed(2)} USD`} />
						</div>
					</ProductDetailSection>
				</motion.div>
			</div>

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
					{/* Categoría */}
					<InfoCard icon={<Icons.tag />} name={product?.category?.name} label='Categoría' />

					{/* Marca */}
					<InfoCard icon={<Icons.brandMedium />} name={product?.brand?.name} label='Marca' />

					{/* Proveedor - ocupa 2 columnas en lg */}
					<div className='lg:col-span-2'>
						<InfoCard icon={<Icons.truck />} name={product?.supplier?.legalName} label='Proveedor' />
					</div>
				</div>
			</motion.div>
		</div>
	</motion.div>
)

const ProductDetailSkeleton = () => (
	<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='space-y-6'>
		<div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
			{/* Imagen skeleton */}
			<motion.div
				initial={{ opacity: 0, scale: 1 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.1 }}
				className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				<Skeleton className='h-72 w-96 rounded-lg' />
			</motion.div>

			{/* Información básica skeleton */}
			<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
				<Skeleton className='h-72 w-full rounded-lg' />
			</motion.div>
		</div>

		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className='h-24 w-full rounded-lg' />
				))}
			</div>
		</motion.div>
	</motion.div>
)

interface ProductDetailErrorProps {
	error: string
	onRetry: () => void
}

const ProductDetailError: React.FC<ProductDetailErrorProps> = ({ error, onRetry }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.9 }}
		animate={{ opacity: 1, scale: 1 }}
		exit={{ opacity: 0, scale: 0.9 }}
		className='space-y-4 py-8 text-center'>
		<Icons.alertCircle className='text-destructive mx-auto h-12 w-12' />
		<Typography variant='h6' className='text-destructive'>
			{error}
		</Typography>
		<Button onClick={onRetry} variant='outline'>
			<Icons.refresh className='mr-2 h-4 w-4' />
			Reintentar
		</Button>
	</motion.div>
)
