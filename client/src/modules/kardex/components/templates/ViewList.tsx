'use client'
import { animations } from '@/lib/animations'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Kardex } from '@/common/types/modules/kardex'
import { Actions } from '@/modules/kardex/components/organisms/Actions'
import { InfoDate } from '@/modules/kardex/components/atoms/InfoDate'
import { MovementTypeBadge } from '@/modules/kardex/components/atoms/MovementTypeBadge'
import { Icons } from '@/components/icons'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ListViewProps {
	recordsData: ReactTable<I_Kardex>
}

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

const getInitials = (firstName?: string, lastName?: string) => {
	const first = firstName?.charAt(0)?.toUpperCase() || ''
	const last = lastName?.charAt(0)?.toUpperCase() || ''
	return `${first}${last}`
}

export const ListView = ({ recordsData }: ListViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-4 space-y-4'
			layout>
			<AnimatePresence mode='sync'>
				{recordsData.getRowModel().rows.map(row => {
					const recordData = row.original
					const backgroundColor = generateBackgroundColor(recordData.product.name)
					const stockChange = recordData.stockAfter - recordData.stockBefore
					const isPositiveChange = stockChange > 0

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
							<Card className='dark:border-border/50 hover:shadow-primary/5 border px-4 shadow-none transition-all duration-500 hover:shadow-lg'>
								<CardContent className='p-0'>
									<div className='flex items-start space-x-6'>
										{/* Product Image/Icon Section */}
										<div
											className='flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg'
											style={{ backgroundColor }}>
											{recordData.product.photo?.path ? (
												<img
													src={recordData.product.photo.path}
													alt={recordData.product.name}
													className='h-20 w-20 object-contain'
												/>
											) : (
												<Icons.package className='text-primary dark:text-primary-foreground h-12 w-12' />
											)}
										</div>

										{/* Main Content */}
										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-4'>
												<div className='min-w-0 flex-1 space-y-4'>
													{/* Header with Product Info and Actions */}
													<div className='flex items-start justify-between gap-4 pb-2'>
														<div className='space-y-1'>
															<div className='flex items-center space-x-3'>
																<Typography variant='h5' className='line-clamp-1'>
																	{recordData.product.name}
																</Typography>
																<Badge variant='outline' className='font-mono text-xs'>
																	{recordData.product.code}
																</Badge>
																<MovementTypeBadge movementType={recordData.movementType} />
															</div>
															{recordData.product.description && (
																<Typography variant='muted' className='line-clamp-1'>
																	{recordData.product.description}
																</Typography>
															)}
														</div>
														<div className='flex-shrink-0'>
															<Actions recordData={recordData} />
														</div>
													</div>

													{/* Main Information Grid */}
													<div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
														{/* Financial Information */}
														<div className='space-y-3'>
															<Typography variant='small' className='text-primary font-semibold'>
																💰 Financial Details
															</Typography>
															<div className='space-y-2'>
																<div className='flex justify-between'>
																	<Typography variant='small' className='text-muted-foreground'>
																		Quantity:
																	</Typography>
																	<Typography variant='small' className='font-medium'>
																		{recordData.quantity.toLocaleString()}
																	</Typography>
																</div>
																<div className='flex justify-between'>
																	<Typography variant='small' className='text-muted-foreground'>
																		Unit Cost:
																	</Typography>
																	<Typography variant='small' className='font-medium'>
																		{formatCurrency(recordData.unitCost)}
																	</Typography>
																</div>
																<div className='flex justify-between'>
																	<Typography variant='small' className='text-muted-foreground'>
																		Subtotal:
																	</Typography>
																	<Typography variant='small'>{formatCurrency(recordData.subtotal)}</Typography>
																</div>
																{recordData.taxAmount > 0 && (
																	<div className='flex justify-between'>
																		<Typography variant='small' className='text-muted-foreground'>
																			Tax ({recordData.taxRate}%):
																		</Typography>
																		<Typography variant='small' className='text-orange-600 dark:text-orange-400'>
																			{formatCurrency(recordData.taxAmount)}
																		</Typography>
																	</div>
																)}
																<Separator className='my-2' />
																<div className='flex justify-between'>
																	<Typography variant='small' className='font-semibold'>
																		Total:
																	</Typography>
																	<Typography variant='small' className='text-primary font-bold'>
																		{formatCurrency(recordData.total)}
																	</Typography>
																</div>
															</div>
														</div>

														{/* Stock Information */}
														<div className='space-y-3'>
															<Typography variant='small' className='text-primary font-semibold'>
																📦 Stock Movement
															</Typography>
															<div className='space-y-2'>
																<div className='flex justify-between'>
																	<Typography variant='small' className='text-muted-foreground'>
																		Before:
																	</Typography>
																	<Typography variant='small'>{recordData.stockBefore.toLocaleString()}</Typography>
																</div>
																<div className='flex justify-between'>
																	<Typography variant='small' className='text-muted-foreground'>
																		After:
																	</Typography>
																	<Typography variant='small' className='font-medium'>
																		{recordData.stockAfter.toLocaleString()}
																	</Typography>
																</div>
																<Separator className='my-2' />
																<div className='flex items-center justify-between'>
																	<Typography variant='small' className='font-semibold'>
																		Change:
																	</Typography>
																	<div className='flex items-center gap-1'>
																		{isPositiveChange ? (
																			<Icons.trendingUp className='h-3 w-3 text-green-500' />
																		) : (
																			<Icons.trendingDown className='h-3 w-3 text-red-500' />
																		)}
																		<Typography
																			variant='small'
																			className={`font-bold ${
																				isPositiveChange
																					? 'text-green-600 dark:text-green-400'
																					: 'text-red-600 dark:text-red-400'
																			}`}>
																			{isPositiveChange ? '+' : ''}
																			{stockChange.toLocaleString()}
																		</Typography>
																	</div>
																</div>
															</div>
														</div>

														{/* Additional Information */}
														<div className='space-y-3'>
															<Typography variant='small' className='text-primary font-semibold'>
																ℹ️ Additional Info
															</Typography>
															<div className='space-y-2'>
																{recordData.product.sku && (
																	<div>
																		<Typography variant='small' className='text-muted-foreground'>
																			SKU:
																		</Typography>
																		<Typography variant='small' className='pl-2 font-mono'>
																			{recordData.product.sku}
																		</Typography>
																	</div>
																)}
																{recordData.product.barCode && (
																	<div>
																		<Typography variant='small' className='text-muted-foreground'>
																			Barcode:
																		</Typography>
																		<Typography variant='small' className='pl-2 font-mono'>
																			{recordData.product.barCode}
																		</Typography>
																	</div>
																)}
																{recordData.reason && (
																	<div>
																		<Typography variant='small' className='text-muted-foreground'>
																			Reason:
																		</Typography>
																		<Typography variant='small' className='line-clamp-2 pl-2 italic'>
																			"{recordData.reason}"
																		</Typography>
																	</div>
																)}
																<div>
																	<Typography variant='small' className='text-muted-foreground'>
																		Current Stock:
																	</Typography>
																	<Typography variant='small' className='text-primary pl-2 font-semibold'>
																		{recordData.product.stock.toLocaleString()} units
																	</Typography>
																</div>
															</div>
														</div>
													</div>

													<Separator />

													{/* Footer with User and Date */}
													<div className='flex items-center justify-between gap-4'>
														<div className='flex items-center gap-3'>
															<Avatar className='h-8 w-8'>
																<AvatarImage src={recordData.user.photo || undefined} />
																<AvatarFallback className='text-xs'>
																	{getInitials(recordData.user.firstName, recordData.user.lastName)}
																</AvatarFallback>
															</Avatar>
															<div>
																<Typography variant='small' className='font-medium'>
																	{recordData.user.firstName} {recordData.user.lastName}
																</Typography>
																<div className='flex items-center gap-2'>
																	<Badge variant='outline' className='text-xs'>
																		{recordData.user.role.name}
																	</Badge>
																	<Typography variant='small' className='text-muted-foreground'>
																		{recordData.user.email}
																	</Typography>
																</div>
															</div>
														</div>
														<InfoDate recordData={recordData} />
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
