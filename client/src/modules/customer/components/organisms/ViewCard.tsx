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

interface CardViewProps {
	table: ReactTable<I_Customer>
	onEdit: (customerData: I_Customer) => void
	onHardDelete: (customerData: I_Customer) => void
}

export const CardView = ({ table, onEdit, onHardDelete }: CardViewProps) => {
	return (
		<div className='space-y-4'>
			<motion.div
				initial='hidden'
				animate='visible'
				variants={animations.container}
				className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
				layout>
				<AnimatePresence mode='sync'>
					{table.getRowModel().rows.map(row => {
						const customerData = row.original
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
								<Card className='dark:border-border/50 flex h-full flex-col border p-0 shadow-none transition-all duration-500'>
									<CardHeader className='flex-none p-4'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
                                                    <Icons.user className='h-5 w-5 text-muted-foreground' />
                                                </div>
                                                <div>
                                                    <Typography variant='h5' className='line-clamp-1'>
                                                        {customerData.firstName} {customerData.lastName}
                                                    </Typography>
                                                    <Typography variant='span' className='text-muted-foreground text-sm'>
                                                        {customerData.identificationNumber}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
										<TableActions customerData={customerData} onEdit={onEdit} onHardDelete={onHardDelete} />
									        </div>
                                        </div>
									</CardHeader>

									<CardContent className='flex-grow px-4 space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <Icons.mail className='h-4 w-4 text-muted-foreground' />
                                            <Typography variant='span' className='text-muted-foreground text-sm'>
                                                {customerData.email || 'No registrado'}
                                            </Typography>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Icons.infoCircle className='h-4 w-4 text-muted-foreground' />
                                            <Typography variant='span' className='text-muted-foreground text-sm'>
                                                {customerData.phone || 'No registrado'}
                                            </Typography>
                                        </div>
									</CardContent>

									<CardFooter className='flex flex-none items-center p-4 pt-0'>
										<TableInfoDate recordData={customerData} />
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
