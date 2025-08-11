'use client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Product } from '@/common/types/modules/product'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { animations } from '@/modules/product/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/product/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/product/components/organisms/Table/TableInfoDate'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'
import { Badge } from '@/components/layout/atoms/Badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/common/utils/formatPrice-util'

interface Props {
	recordsData: ReactTable<I_Product>
	onEdit: (recordData: I_Product) => void
	onHardDelete: (recordData: I_Product) => void
}

export const CardView = ({ recordsData, onEdit, onHardDelete }: Props) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
			layout>
			<AnimatePresence mode='sync'>
				{recordsData.getRowModel().rows.map(row => {
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
							<Card className='border-border/50 flex h-full flex-col overflow-hidden border p-0 transition-all duration-300'>
								<CardHeader className='flex-none p-0'>
									<div className='relative h-48 w-full'>
										<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
											<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
										</div>
										{recordData?.photo ? (
											<Image
												src={recordData.photo?.path}
												alt={recordData.name}
												fill
												unoptimized
												className='bg-muted rounded-t-xl object-contain'
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

								<CardContent className='flex-grow px-4 py-0'>
									<div className='flex h-full flex-col space-y-3'>
										{/* Título y código */}
										<div className='space-y-2'>
											<div className='flex items-center justify-between gap-4'>
												<Typography variant='overline' className='line-clamp-1 break-words'>
													{recordData.code}
												</Typography>

												<ProductStatusBadge status={recordData.status} />
											</div>

											<Typography variant='h5' className='line-clamp-1 break-words'>
												{recordData.name}
											</Typography>
										</div>

										{/* Precio y Stock */}
										<div className='flex items-center justify-between'>
											<Typography variant='h6' className='text-primary font-semibold'>
												${formatPrice(recordData.price)} USD
											</Typography>

											<div className='flex items-center gap-1'>
												<Badge text={`${recordData.stock} und`} variant='info' />
											</div>
										</div>

										<div className='flex items-center gap-2'>
											<Icons.barCode className='text-primary h-4 w-4' />
											<Typography variant='span' className='text-primary text-sm'>
												{recordData?.barCode || 'N/A'}
											</Typography>
										</div>

										<Separator />

										{/* Marca y Categoría */}
										<div className='space-y-2'>
											<div className='flex items-center gap-2'>
												<Icons.brandMedium className='text-muted-foreground h-4 w-4' />
												<Typography variant='span' className='text-muted-foreground text-xs'>
													{recordData?.brand?.name || 'N/A'}
												</Typography>
											</div>

											<div className='flex items-center gap-2'>
												<Icons.listDetails className='text-muted-foreground h-4 w-4' />
												<Typography variant='span' className='text-muted-foreground text-xs'>
													{recordData?.category?.name || 'N/A'}
												</Typography>
											</div>

											<div className='flex items-center gap-2'>
												<Icons.truck className='text-muted-foreground h-4 w-4' />
												<Typography variant='span' className='text-muted-foreground line-clamp-1 text-xs'>
													{recordData?.supplier?.legalName || 'N/A'}
												</Typography>
											</div>
										</div>

										{/* Descripción */}
										<Typography variant='span' className='text-muted-foreground line-clamp-3 flex-grow text-sm'>
											{recordData.description || 'Sin descripción'}
										</Typography>
									</div>
								</CardContent>

								<CardFooter className='flex flex-none items-center justify-between px-4 pb-4'>
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
