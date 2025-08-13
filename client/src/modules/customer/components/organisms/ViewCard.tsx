'use client'

import React from 'react'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Customer } from '@/common/types/modules/customer'
import { animations } from '@/modules/customer/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/customer/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/customer/components/organisms/Table/TableInfoDate'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CardViewProps {
	recordsData: ReactTable<I_Customer>
	onEdit: (record: I_Customer) => void
	onHardDelete: (record: I_Customer) => void
}

export const CardView = ({ recordsData, onEdit, onHardDelete }: CardViewProps) => {
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
						const initials = `${recordData?.firstName?.charAt(0)}${recordData?.lastName?.charAt(0)}`

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
								<Card className='dark:border-border/50 flex h-full flex-col border p-4 shadow-none transition-all duration-500'>
									<CardHeader className='p-4'>
										<div className='flex flex-col items-center justify-center'>
											<div className='flex flex-col items-center justify-center space-y-4'>
												<Avatar className='h-24 w-24'>
													<AvatarImage src={recordData.firstName} />
													<AvatarFallback className='bg-primary text-primary-foreground'>{initials}</AvatarFallback>
												</Avatar>

												<Typography variant='h5' className='line-clamp-1 break-words'>
													{recordData.firstName} {recordData.lastName}
												</Typography>
											</div>

											<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
											</div>
										</div>
									</CardHeader>

									<CardContent className='flex-grow space-y-2 px-4'>
										<div className='flex items-center gap-2'>
											<Icons.id className='text-muted-foreground h-4 w-4' />
											<Typography variant='span' className='text-muted-foreground text-sm'>
												{recordData.identificationNumber || 'No registrado'}
											</Typography>
										</div>

										<div className='flex items-center gap-2'>
											<Icons.mail className='text-muted-foreground h-4 w-4' />
											<Typography variant='span' className='text-muted-foreground truncate text-sm'>
												{recordData.email || 'No registrado'}
											</Typography>
										</div>

										<div className='flex items-center gap-2'>
											<Icons.phone className='text-muted-foreground h-4 w-4' />
											<Typography variant='span' className='text-muted-foreground text-sm'>
												{recordData.phone || 'No registrado'}
											</Typography>
										</div>
									</CardContent>

									<CardFooter className='flex flex-none items-center p-4 pt-0'>
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
