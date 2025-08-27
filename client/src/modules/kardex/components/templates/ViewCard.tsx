'use client'
import { Icons } from '@/components/icons'
import { animations } from '@/lib/animations'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Kardex } from '@/common/types/modules/kardex'
import { Actions } from '@/modules/kardex/components/organisms/Actions'
import { InfoDate } from '@/modules/kardex/components/atoms/InfoDate'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { MovementTypeBadge } from '@/modules/kardex/components/atoms/MovementTypeBadge'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { UserRoleBadge } from '@/modules/user/components/atoms/UserRoleBadge'

interface CardViewProps {
	recordsData: ReactTable<I_Kardex>
}

const getInitials = (firstName?: string, lastName?: string) => {
	const first = firstName?.charAt(0)?.toUpperCase() || ''
	const last = lastName?.charAt(0)?.toUpperCase() || ''
	return `${first}${last}`
}

export const CardView = ({ recordsData }: CardViewProps) => {
	return (
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
						const stockChange = recordData.stockAfter - recordData.stockBefore
						const isPositiveChange = stockChange > 0

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
								<Card className='h-full border p-0 shadow-none transition-all duration-500'>
									<CardHeader className='flex-none p-0'>
										<div className='bg-muted relative flex h-40 w-full items-center justify-center rounded-t-lg'>
											{/* Product Image */}
											{recordData.product.photo?.path && (
												<Image
													src={recordData.product.photo.path}
													alt={recordData.product.name}
													fill
													unoptimized
													className='h-24 w-24 object-contain'
												/>
											)}

											{/* Actions */}
											<div className='bg-background/80 absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<Actions recordData={recordData} />
											</div>

											{/* Product Code Badge */}
											<div className='absolute top-2 left-2'>
												<Badge variant='secondary' className='font-mono'>
													{recordData.product.code}
												</Badge>
											</div>
										</div>
									</CardHeader>

									<CardContent className='flex-grow space-y-3'>
										<div className='space-y-2'>
											<InfoDate recordData={recordData} />

											<Typography variant='h5' className='line-clamp-2 min-h-[2.5rem]'>
												{recordData.product.name}
											</Typography>

											{recordData.product.description && (
												<Typography variant='muted' className='line-clamp-2 text-sm'>
													{recordData.product.description}
												</Typography>
											)}

											{/* 
											{recordData.reason && (
												<Typography variant='muted' className='line-clamp-2 text-sm italic'>
													{recordData.reason}
												</Typography>
											)}
											*/}
										</div>

										<Separator />

										{/* Financial Info */}
										<div className='space-y-2'>
											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Tipo
												</Typography>
												<MovementTypeBadge movementType={recordData.movementType} />
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Cantidad
												</Typography>
												<Typography variant='span' className='font-medium'>
													{recordData.quantity.toLocaleString()}
												</Typography>
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Cost unid.
												</Typography>
												<Typography variant='span' className='font-medium'>
													${formatPrice(recordData.unitCost)}
												</Typography>
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Total
												</Typography>
												<Typography variant='span' className='text-primary font-bold'>
													${formatPrice(recordData.total)}
												</Typography>
											</div>

											{recordData.taxAmount > 0 && (
												<div className='flex items-center justify-between'>
													<Typography variant='span' className='text-muted-foreground'>
														Impusto ({recordData.taxRate}%)
													</Typography>
													<Typography variant='span' className='text-orange-600 dark:text-orange-400'>
														${formatPrice(recordData.taxAmount)}
													</Typography>
												</div>
											)}
										</div>

										<Separator />

										{/* Stock Info */}
										<div className='space-y-2'>
											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Stock antes
												</Typography>
												<Typography variant='span' className='font-mono'>
													{recordData.stockBefore}
												</Typography>
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Stock Actual
												</Typography>
												<Typography variant='span' className='font-mono'>
													{recordData.stockAfter}
												</Typography>
											</div>

											<div className='flex items-center justify-between'>
												<Typography variant='span' className='text-muted-foreground'>
													Cambio
												</Typography>
												<div className='flex items-center gap-1'>
													{isPositiveChange ? (
														<Icons.trendingUp className='h-4 w-4 text-green-500' />
													) : (
														<Icons.trendingDown className='text-destructive h-4 w-4' />
													)}
													<Typography
														variant='span'
														className={`font-mono ${
															isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-destructive'
														}`}>
														{isPositiveChange ? '+' : ''}
														{stockChange}
													</Typography>
												</div>
											</div>
										</div>
									</CardContent>

									<Separator />

									<CardFooter className='flex-none space-y-3 p-4 pt-0'>
										{/* User Info */}
										<div className='flex w-full items-center gap-2'>
											<Avatar className='h-6 w-6'>
												<AvatarImage src={recordData?.user?.photo?.path} />
												<AvatarFallback className='text-xs'>
													{getInitials(recordData.user.firstName, recordData.user.lastName)}
												</AvatarFallback>
											</Avatar>

											<div className='flex w-full items-center justify-between'>
												<Typography variant='small' className='font-medium'>
													{recordData.user.firstName} {recordData.user?.lastName?.charAt(0)}
												</Typography>
												<UserRoleBadge role={recordData.user.role} />
											</div>
										</div>
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
