'use client'

import { Table as ReactTable } from '@tanstack/react-table'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Supplier } from '@/common/types/modules/supplier'
import { animations } from '@/modules/supplier/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/supplier/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/supplier/components/organisms/Table/TableInfoDate'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'

interface Props {
	recordsData: ReactTable<I_Supplier>
	onEdit: (recordData: I_Supplier) => void
	onHardDelete: (recordData: I_Supplier) => void
}

export const CardView = ({ recordsData, onEdit, onHardDelete }: Props) => {
	const rows = recordsData.getRowModel().rows

	return (
		<div className='space-y-4'>
			<motion.div
				initial='hidden'
				animate='visible'
				variants={animations.container}
				className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
				layout>
				<AnimatePresence mode='sync'>
					{rows.map(row => {
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
								<Card className='border-border/50 flex h-full flex-col overflow-hidden p-0'>
									<CardHeader className='flex-none p-0'>
										<div className='relative flex h-32 w-full items-center justify-center'>
											{/* Ícono con fondo de color aleatorio */}
											<div className='flex h-32 w-full items-center justify-center' style={{ backgroundColor }}>
												<Icons.truck className='text-muted h-12 w-12' />
											</div>

											{/* Acciones con mejor posicionamiento */}
											<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
											</div>
										</div>
									</CardHeader>

									<CardContent className='flex-grow px-4'>
										<div className='flex h-full flex-col space-y-3'>
											<Badge
												variant={row.original.status === 'active' ? 'success' : 'warning'}
												text={row.original.status === 'active' ? 'Activo' : 'Inactivo'}
											/>

											<Typography variant='h6'>{recordData.legalName}</Typography>

											<div className='flex flex-col space-y-2'>
												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.hash className='text-muted-foreground h-4 w-4' />
													</div>
													<Typography variant='small'>{recordData.ruc}</Typography>
												</div>

												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.store className='text-muted-foreground h-4 w-4' />
													</div>
													<Typography variant='small'>{recordData.commercialName || 'Sin nombre comercial'}</Typography>
												</div>
											</div>
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
}
