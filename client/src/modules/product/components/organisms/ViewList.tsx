'use client'

import { Table as ReactTable } from '@tanstack/react-table'

import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { I_Product } from '@/modules/product/types/product'
import { animations } from '@/modules/product/components/atoms/animations'
import { TableActions } from '@/modules/product/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/product/components/organisms/Table/TableInfoDate'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'
import Image from 'next/image'

interface Props {
	recordsData: ReactTable<I_Product>
	onEdit: (recordData: I_Product) => void
	onHardDelete: (recordData: I_Product) => void
}

export const ListView = ({ recordsData, onEdit, onHardDelete }: Props) => {
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
		if (stock < 10) return `Stock bajo (${stock})`
		return `${stock} unidades`
	}

	return (
		<div className='space-y-4'>
			<motion.div initial='hidden' animate='visible' variants={animations.container} className='space-y-4' layout>
				<AnimatePresence mode='sync'>
					{rows.map(row => {
						const recordData = row.original

						return (
							<motion.div
								key={row.id}
								variants={animations.listItem}
								initial='hidden'
								animate='visible'
								exit='exit'
								whileHover='hover'
								layout
								className='group'>
								<Card className='border-border/50 overflow-hidden p-0'>
									<CardContent className='p-4'>
										<div className='flex items-start space-x-4'>
											{/* Imagen del producto o ícono con fondo de color */}
											<div className='bg-muted/20 relative h-72 w-72 flex-shrink-0 rounded-xl'>
												{recordData?.photo ? (
													<Image
														src={recordData.photo.path}
														alt={recordData.name}
														fill
														unoptimized
														className='border-border/50 rounded-lg border object-contain'
													/>
												) : (
													<div className='bg-muted/50 flex h-full w-full items-center justify-center rounded-lg'>
														<Icons.media className='text-muted-foreground h-8 w-8' />
													</div>
												)}
											</div>

											<div className='min-w-0 flex-1'>
												<div className='flex items-start justify-between gap-4'>
													<div className='min-w-0 flex-1 space-y-3'>
														{/* Header con nombre del producto y acciones */}
														<div className='flex items-start justify-between gap-4 pb-2'>
															<div className='flex items-center space-x-3'>
																<Typography variant='h5' className='line-clamp-2'>
																	{recordData.name}
																</Typography>
																<Badge
																	decord={false}
																	variant={recordData.status === 'active' ? 'success' : 'secondary'}
																	text={recordData.status === 'active' ? 'Activo' : 'Borrador'}
																/>
															</div>

															<div className='flex-shrink-0'>
																<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
															</div>
														</div>

														{/* Descripción del producto */}
														{recordData.description && (
															<Typography variant='p' className='text-muted-foreground line-clamp-2'>
																{recordData.description}
															</Typography>
														)}

														{/* Información principal */}
														<div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.hash className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>Código:</Typography>
																</div>
																<Typography variant='p' className='pl-6 font-mono'>
																	{recordData.code}
																</Typography>
															</div>

															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.tag className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>SKU:</Typography>
																</div>
																<Typography variant='p' className='pl-6 font-mono'>
																	{recordData.sku}
																</Typography>
															</div>

															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.hash className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>Código de Barras:</Typography>
																</div>
																<Typography variant='p' className='pl-6 font-mono'>
																	{recordData.barCode}
																</Typography>
															</div>
														</div>

														{/* Información de marca, categoría y proveedor */}
														<div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.building className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>Marca:</Typography>
																</div>
																<Typography variant='p' className='pl-6'>
																	{recordData.brand?.name || 'Sin marca'}
																</Typography>
															</div>

															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.folder className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>Categoría:</Typography>
																</div>
																<Typography variant='p' className='pl-6'>
																	{recordData.category?.name || 'Sin categoría'}
																</Typography>
															</div>

															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.truck className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>Proveedor:</Typography>
																</div>
																<Typography variant='p' className='pl-6'>
																	{recordData.supplier?.commercialName ||
																		recordData.supplier?.legalName ||
																		'Sin proveedor'}
																</Typography>
															</div>
														</div>

														<Separator />

														{/* Footer con precio, stock y fecha */}
														<div className='flex items-center justify-between gap-4'>
															<div className='flex items-center space-x-4'>
																{/* Precio */}
																<div className='flex items-center space-x-2'>
																	<Icons.tag className='text-muted-foreground h-4 w-4' />
																	<Typography variant='h6' className='text-primary'>
																		{formatPrice(recordData.price)}
																	</Typography>
																</div>

																{/* Stock */}
																<Badge
																	decord={false}
																	variant={getStockBadgeVariant(recordData.stock)}
																	text={getStockText(recordData.stock)}
																/>
															</div>

															<TableInfoDate recordData={recordData} />
														</div>
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
