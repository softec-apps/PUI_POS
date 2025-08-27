'use client'

import { Icons } from '@/components/icons'
import { animations } from '@/lib/animations'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Supplier } from '@/common/types/modules/supplier'
import { Actions } from '@/modules/supplier/components/organisms/Actions'
import { InfoDate } from '@/modules/supplier/components/atoms/InfoDate'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/modules/supplier/components/atoms/StatusBadge'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'

interface CardViewProps {
	recordsData: ReactTable<I_Supplier>
	onEdit: (supplierData: I_Supplier) => void
	onHardDelete: (supplierData: I_Supplier) => void
	onSoftDelete: (supplierData: I_Supplier) => void
	onRestore: (supplierData: I_Supplier) => void
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
						const recordData = row.original
						const backgroundColor = generateBackgroundColor(recordData.legalName)

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
										<div className='relative flex h-32 w-full items-center justify-center'>
											{/* Ícono con fondo de color aleatorio */}
											<div
												className='flex h-32 w-full items-center justify-center rounded-t-xl'
												style={{ backgroundColor }}>
												<Icons.truck className='text-primary dark:text-primary-foreground h-12 w-12' />
											</div>

											{/* Acciones con mejor posicionamiento */}
											<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<Actions
													recordData={recordData}
													onEdit={onEdit}
													onHardDelete={onHardDelete}
													onSoftDelete={onSoftDelete}
													onRestore={onRestore}
												/>
											</div>
										</div>
									</CardHeader>

									<CardContent className='flex-grow px-4'>
										<div className='flex h-full flex-col space-y-2'>
											<StatusBadge status={recordData.status} />

											<Typography variant='h5' className='line-clamp-1'>
												{recordData.legalName}
											</Typography>

											<Typography variant='span' className='line-clamp-1'>
												{recordData.ruc}
											</Typography>

											<Typography variant='span' className='line-clamp-1'>
												{recordData.commercialName}
											</Typography>
										</div>
									</CardContent>

									<CardFooter className='flex flex-none items-center p-4 pt-0'>
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
