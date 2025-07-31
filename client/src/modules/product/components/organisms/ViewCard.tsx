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
