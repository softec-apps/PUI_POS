'use client'

import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/layout/atoms/Badge'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Product } from '@/common/types/modules/product'
import { animations } from '@/modules/product/components/atoms/animations'
import { TableActions } from '@/modules/product/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/product/components/organisms/Table/TableInfoDate'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { ImageControl } from '@/components/layout/organims/ImageControl'

interface Props {
	recordsData: ReactTable<I_Product>
	onEdit: (recordData: I_Product) => void
	onHardDelete: (recordData: I_Product) => void
}

export const ListView = ({ recordsData, onEdit, onHardDelete }: Props) => (
	<div className='space-y-4'>
		<motion.div initial='hidden' animate='visible' variants={animations.container} className='space-y-4' layout>
			<AnimatePresence mode='sync'>
				{recordsData.getRowModel().rows.map(row => {
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
							<Card className='border-border/50 overflow-hidden border p-0 shadow-none transition-all duration-300'>
								<CardContent className='p-4'>
									<div className='flex items-start space-x-4'>
										{/* Imagen del producto */}
										<div className='relative'>
											<ImageControl
												recordData={recordData}
												imageWidth={280}
												imageHeight={250}
												enableHover={false}
												enableClick={false}
											/>
										</div>

										{/* Información del producto */}
										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-3'>
													{/* Header: Título y acciones */}
													<div className='flex items-start justify-between gap-2'>
														<div className='min-w-0 flex-1'>
															<Typography variant='h6' className='mb-2 line-clamp-1 break-words'>
																{recordData.name}
															</Typography>
															<div className='flex items-center gap-4'>
																<div className='flex items-center gap-2'>
																	<Icons.barCode className='text-primary h-4 w-4' />
																	<Typography variant='span' className='text-primary text-sm'>
																		{recordData?.barCode || 'N/A'}
																	</Typography>
																</div>

																<Typography variant='overline' className='line-clamp-1 break-words'>
																	{recordData.code}
																</Typography>
															</div>
														</div>

														<div className='flex-shrink-0'>
															<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													{/* Precio y Stock */}
													<div className='flex items-center gap-4'>
														<div className='flex items-center justify-between'>
															<Typography variant='h6' className='text-primary font-semibold'>
																${formatPrice(recordData.price)} USD
															</Typography>
														</div>

														<Badge
															text={`${recordData.stock} unidad${recordData.stock > 1 ? 'es' : ''}`}
															variant='info'
														/>
													</div>

													{/* Información de clasificación */}
													<div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
														<div className='flex items-center gap-2'>
															<Icons.brandMedium className='text-muted-foreground h-3 w-3' />
															<Typography variant='span' className='text-muted-foreground text-sm'>
																Marca: {recordData?.brand?.name || 'N/A'}
															</Typography>
														</div>

														<div className='flex items-center gap-2'>
															<Icons.listDetails className='text-muted-foreground h-3 w-3' />
															<Typography variant='span' className='text-muted-foreground text-sm'>
																Categoría: {recordData.category?.name || 'N/A'}
															</Typography>
														</div>

														<div className='flex items-center gap-2'>
															<Icons.truck className='text-muted-foreground h-3 w-3' />
															<Typography variant='span' className='text-muted-foreground line-clamp-1 text-sm'>
																Proveedor: {recordData?.supplier?.legalName || 'N/A'}
															</Typography>
														</div>
													</div>

													{/* Descripción */}
													<Typography variant='span' className='text-muted-foreground line-clamp-2 text-sm break-words'>
														{recordData.description || 'Sin descripción'}
													</Typography>

													<Separator />

													{/* Footer: Status y fecha */}
													<div className='flex items-center justify-between gap-2'>
														<ProductStatusBadge status={recordData.status} />

														{recordData.isVariant && <Badge variant='default' text='Producto variante' />}
														<div className='text-muted-foreground text-right text-xs'>
															<TableInfoDate recordData={recordData} />
														</div>
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
