'use client'

import { Table as ReactTable } from '@tanstack/react-table'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Product } from '@/modules/product/types/product'
import { animations } from '@/modules/product/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/product/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/product/components/organisms/Table/TableInfoDate'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'
import { ProductStatusBadge } from '../atoms/ProductStatusBadge'
import Image from 'next/image'

// Datos de ejemplo basados en tu objeto
const exampleProductData: I_Product = {
	status: 'draft',
	id: '68a3233f-472e-412c-91fa-75b566a386bb',
	isVariant: false,
	code: 'PROD-68A3233F-00008',
	name: 'Camiseta Básica Algodón',
	description: 'Camiseta básica de algodón 100%, perfecta para uso diario',
	price: 29.123456,
	sku: 'CAM-LRG-AZU-M',
	barCode: '7860001234567',
	stock: 0,
	brand: {
		id: '77c585ef-df5c-40f7-a8d2-b92e49d0e9a5',
		name: 'Nike',
		status: 'active',
		createdAt: '2025-07-26T01:11:17.974Z',
		deletedAt: null,
		description: null,
		updatedAt: '2025-07-26T01:46:02.704Z',
	},
	category: {
		id: '46c14dfd-df0c-4260-be48-af55b5bb8972',
		name: 'Ropa',
		status: 'active',
		createdAt: '2025-07-26T01:08:28.847Z',
		deletedAt: null,
		description: null,
		photo: {
			id: '03459676-f941-4017-a17b-680fe8eb2e0d',
			path: 'http://localhost:4000/api/v1/files/ee8a130817358a98c0d84.png',
		},
		updatedAt: '2025-07-26T22:43:40.229Z',
	},
	supplier: {
		id: 'd3e9ec9a-ef0d-4970-b3ab-3a59a1e27952',
		ruc: '0190001628001',
		legalName: 'AUSTRAL CIA LTDA',
		commercialName: 'ROPA FULL',
		createdAt: '2025-07-26T01:10:57.626Z',
		deletedAt: null,
		status: 'active',
		updatedAt: '2025-07-26T01:10:57.626Z',
	},
	photo: null,
	template: null,
	createdAt: '2025-07-26T02:37:38.973Z',
	deletedAt: null,
	updatedAt: '2025-07-26T02:37:38.973Z',
}

interface Props {
	recordsData: ReactTable<I_Product>
	onEdit: (recordData: I_Product) => void
	onHardDelete: (recordData: I_Product) => void
}

export const CardView = ({ recordsData, onEdit, onHardDelete }: Props) => {
	const rows = recordsData.getRowModel().rows

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('es-EC', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(price)
	}

	const getStockBadgeVariant = (stock: number) => {
		if (stock === 0) return 'destructive'
		if (stock < 10) return 'warning'
		return 'success'
	}

	const getStockText = (stock: number) => {
		if (stock === 0) return 'Sin stock'
		if (stock < 10) return 'Stock bajo'
		return `${stock} unidades`
	}

	return (
		<div className='space-y-4'>
			<motion.div
				initial='hidden'
				animate='visible'
				variants={animations.container}
				className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
				layout>
				<AnimatePresence mode='sync'>
					{rows.map(row => {
						const recordData = row.original
						const backgroundColor = generateBackgroundColor(recordData.name)

						return (
							<motion.div
								key={row.id}
								variants={animations.cardItem}
								initial='hidden'
								animate='visible'
								exit='exit'
								whileHover='hover'
								layout
								className='group relative'>
								<Card className='border-border/50 flex h-full flex-col overflow-hidden p-0'>
									<CardHeader className='flex-none p-0'>
										<div className='relative h-48 w-full'>
											<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
											</div>

											{recordData?.photo ? (
												<Image
													src={recordData.photo.path}
													alt={recordData.name}
													fill
													unoptimized
													className='bg-muted rounded-t-xl object-cover'
												/>
											) : (
												<div className='bg-muted/50 flex h-full items-center justify-center'>
													<div className='text-muted-foreground flex flex-col items-center space-y-2'>
														<Icons.media className='h-12 w-12' />
													</div>
												</div>
											)}
										</div>
									</CardHeader>

									<CardContent className='flex-grow px-4 py-3'>
										<div className='flex h-full flex-col space-y-3'>
											{/* Nombre del producto */}
											<Typography variant='h6' className='line-clamp-2'>
												{recordData.name}
											</Typography>

											{/* Código y SKU */}
											<div className='flex flex-col space-y-2'>
												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.hash className='text-muted-foreground h-4 w-4' />
													</div>
													<Typography variant='small' className='text-muted-foreground'>
														{recordData.code}
													</Typography>
												</div>

												{/* Marca y Categoría */}
												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.brandMedium className='text-muted-foreground h-4 w-4' />
													</div>
													<Typography variant='small' className='text-muted-foreground'>
														{recordData.brand?.name} • {recordData.category?.name}
													</Typography>
												</div>

												{/* Precio */}
												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.tag className='text-muted-foreground h-4 w-4' />
													</div>
													<Typography variant='small' className='text-primary/90'>
														{formatPrice(recordData.price)}
													</Typography>
												</div>

												{/* Unidades */}
												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.product className='text-muted-foreground h-4 w-4' />
													</div>
													<Typography variant='small' className='text-primary/90'>
														{recordData.stock} unidades
													</Typography>
												</div>
											</div>
										</div>
									</CardContent>

									<CardFooter className='flex flex-none items-center justify-between p-4'>
										<ProductStatusBadge status={recordData.status} />

										{/* Fecha de creación */}
										<TableInfoDate recordData={recordData} />
									</CardFooter>
								</Card>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
