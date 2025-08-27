'use client'

import React from 'react'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Sale } from '@/common/types/modules/sale'
import { animations } from '@/lib/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Actions } from '@/modules/sale/components/organisms/Actions'
import { InfoDate } from '@/modules/sale/components/atoms/InfoDate'
import { MethodPaymentBadge } from '@/modules/sale/components/atoms/MethodPaymentBadge'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import Link from 'next/link'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'

interface CardViewProps {
	recordsData: ReactTable<I_Sale>
}

export const CardView = ({ recordsData }: CardViewProps) => {
	return (
		<div className='space-y-6'>
			<motion.div
				initial='hidden'
				animate='visible'
				variants={animations.container}
				className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
				layout>
				<AnimatePresence mode='popLayout'>
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
								<Card className='p-0'>
									{/* HEADER */}
									<CardHeader className='pt-4'>
										<div className='flex items-start justify-between'>
											<div className='flex items-center gap-2'>
												<Typography variant='overline' className='text-xl font-bold tracking-tight'>
													#{recordData.code}
												</Typography>
											</div>
											<Actions recordData={recordData} />
										</div>
									</CardHeader>

									{/* CONTENT */}
									<CardContent className='flex-grow space-y-4 px-5'>
										{/* Cliente */}
										<div className='dark:bg-popover bg-accent/40 flex items-center gap-3 rounded-xl p-3'>
											<div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
												<Icons.user className='text-primary h-4 w-4' />
											</div>
											<div className='flex flex-col'>
												<Typography variant='small' className='font-medium'>
													{recordData.customer.firstName} {recordData.customer.lastName}
												</Typography>
											</div>
										</div>

										{/* Productos con HoverCard */}
										<HoverCard>
											<HoverCardTrigger asChild>
												<Button variant='outline' size='lg' className='flex w-full justify-between rounded-xl'>
													<Typography variant='small' className='font-medium'>
														Productos
													</Typography>

													<span className='flex text-xs'>
														{recordData.totalItems} {recordData.totalItems > 1 ? 'items' : 'item'}
														<Icons.chevronDown className='ml-1 h-3 w-3 transition-transform group-hover:rotate-180' />
													</span>
												</Button>
											</HoverCardTrigger>

											<HoverCardContent align='center' className='w-80 overflow-hidden p-0 shadow-xl'>
												<ul className='divide-border divide-y'>
													{recordData.items.map((item, idx) => (
														<motion.li
															key={idx}
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ delay: idx * 0.05 }}>
															<Link
																href={`${ROUTE_PATH.ADMIN.PRODUCT}/${item.product?.id ?? ''}`}
																className='hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors'>
																{/* Imagen del producto */}
																{item.product?.photo && (
																	<div className='relative flex-shrink-0 overflow-hidden rounded-md border'>
																		<ImageControl
																			recordData={item.product.photo}
																			enableHover={false}
																			enableClick={false}
																			imageHeight={45}
																			imageWidth={45}
																			className='object-cover'
																		/>
																	</div>
																)}

																{/* Info */}
																<div className='flex flex-1 flex-col overflow-hidden'>
																	<Typography variant='span' className='truncate font-medium'>
																		{item.product?.name ?? item.productName}
																	</Typography>

																	<div className='flex items-center justify-between'>
																		<Typography variant='muted' className='text-xs'>
																			{item.quantity} × ${formatPrice(item.unitPrice)}
																		</Typography>
																		<Typography variant='span' className='font-semibold'>
																			${formatPrice(item.totalPrice)}
																		</Typography>
																	</div>
																</div>
															</Link>
														</motion.li>
													))}
												</ul>
											</HoverCardContent>
										</HoverCard>

										{/* Totales */}
										<div className='space-y-2.5 pt-2'>
											<div className='flex items-center justify-between'>
												<Typography variant='muted' className='text-sm'>
													Método:
												</Typography>
												<MethodPaymentBadge type={recordData.paymentMethod} />
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='muted' className='text-sm'>
													Subtotal:
												</Typography>
												<Typography variant='span' className='text-sm font-medium'>
													${formatPrice(recordData.subtotal)}
												</Typography>
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='muted' className='text-sm'>
													Impuesto:
												</Typography>
												<Typography variant='span' className='text-sm font-medium'>
													${formatPrice(recordData.taxAmount)}
												</Typography>
											</div>

											<div className='flex items-center justify-between border-t border-dashed pt-2.5'>
												<Typography variant='span' className='text-primary text-lg font-bold'>
													Total:
												</Typography>
												<Typography variant='span' className='text-primary text-lg font-bold'>
													${formatPrice(recordData.total)}
												</Typography>
											</div>
										</div>
									</CardContent>

									{/* FOOTER */}
									<CardFooter className='flex flex-none items-center border-t p-5 pt-0'>
										<InfoDate recordData={recordData} />
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
