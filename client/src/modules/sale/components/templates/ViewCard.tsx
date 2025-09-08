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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/layout/atoms/Badge'

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
										<div className='flex items-center justify-between'>
											<InfoDate recordData={recordData} />
											<Actions recordData={recordData} />
										</div>
									</CardHeader>

									{/* CONTENT */}
									<CardContent className='flex-grow space-y-4 pb-4'>
										<div className='dark:bg-popover bg-accent/40 flex items-center justify-center gap-3 rounded-xl p-3'>
											<Typography variant='muted' className='text-sm'>
												<Icons.shoppingCart />
											</Typography>
											<Typography variant='overline' className='text-xl font-bold tracking-tight'>
												#{recordData.code}
											</Typography>
										</div>

										{/* Totales */}
										<div className='space-y-2.5 pt-2'>
											{recordData?.clave_acceso && (
												<div className='flex items-center justify-between border-b border-dashed pb-2.5'>
													<Typography variant='muted' className='text-sm'>
														Estado SRI:
													</Typography>
													{(() => {
														const estado = row.original?.estado_sri

														let variant: 'default' | 'destructive' | 'warning' | 'success' = 'default'
														if (estado === 'AUTHORIZED') variant = 'success'
														else if (estado === 'PENDING') variant = 'warning'

														return (
															<Badge
																variant={variant}
																text={
																	estado === 'AUTHORIZED'
																		? 'Autorizado'
																		: estado === 'PENDING'
																			? 'Pendiente'
																			: estado || '-'
																}
															/>
														)
													})()}
												</div>
											)}

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
								</Card>
							</motion.div>
						)
					})}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
