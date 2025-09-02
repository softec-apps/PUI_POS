'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import { Icons } from '@/components/icons'
import { animations } from '@/lib/animations'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Category } from '@/common/types/modules/category'
import { Actions } from '@/modules/category/components/organisms/Actions'
import { InfoDate } from '@/modules/category/components/atoms/InfoDate'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/modules/category/components/atoms/StatusBadge'

interface CardViewProps {
	recordsData: ReactTable<I_Category>
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
	onSoftDelete: (categoryData: I_Category) => void
	onRestore: (categoryData: I_Category) => void
}

export const CardView = ({ recordsData, onEdit, onHardDelete, onSoftDelete, onRestore }: CardViewProps) => {
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
						const categoryData = row.original
						const description = categoryData.description || 'Sin descripción'
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
								<Card className='dark:border-border/50 h-full border p-0 shadow-none transition-all duration-500'>
									<CardHeader className='flex-none p-0'>
										<div className='relative h-48 w-full'>
											<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<Actions
													recordData={categoryData}
													onEdit={onEdit}
													onHardDelete={onHardDelete}
													onSoftDelete={onSoftDelete}
													onRestore={onRestore}
												/>
											</div>

											{categoryData?.photo ? (
												<Image
													src={categoryData.photo.path}
													alt={categoryData.name}
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

									<CardContent className='flex-grow px-4'>
										<div className='flex h-full flex-col space-y-2'>
											<StatusBadge status={categoryData.status} />

											<Typography variant='h5' className='line-clamp-1'>
												{categoryData.name}
											</Typography>

											<Typography variant='span' className='text-muted-foreground line-clamp-4 flex-grow text-sm'>
												{description}
											</Typography>
										</div>
									</CardContent>

									<CardFooter className='flex flex-none items-center p-4 pt-0'>
										<InfoDate recordData={categoryData} />
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
