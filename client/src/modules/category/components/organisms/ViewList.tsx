'use client'

import Image from 'next/image'
import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Category } from '@/modules/category/types/category'
import { animations } from '@/modules/category/components/atoms/animations'
import { TableActions } from '@/modules/category/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/category/components/organisms/Table/TableInfoDate'

interface ListViewProps {
	table: ReactTable<I_Category>
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
}

export const ListView = ({ table, onEdit, onHardDelete }: ListViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-2 gap-4 space-y-4'
			layout>
			<AnimatePresence mode='sync'>
				{table.getRowModel().rows.map(row => {
					const categoryData = row.original
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
							<Card className='border-border/50 overflow-hidden border shadow-none transition-all duration-300'>
								<CardContent>
									<div className='flex items-start space-x-4'>
										<div className='bg-muted/20 relative h-32 w-40 flex-shrink-0 rounded-xl'>
											{categoryData?.photo ? (
												<Image
													src={categoryData.photo.path}
													alt={categoryData.name}
													fill
													unoptimized
													className='rounded-lg object-contain'
												/>
											) : (
												<div className='bg-muted/50 flex h-full w-full items-center justify-center rounded-lg'>
													<Icons.media className='text-muted-foreground h-8 w-8' />
												</div>
											)}
										</div>

										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-3'>
													<div className='mb-1 flex items-start justify-between gap-2'>
														<Typography variant='h6' className='line-clamp-1 break-words'>
															{categoryData.name}
														</Typography>

														<div className='flex-shrink-0'>
															<TableActions categoryData={categoryData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<div className='flex items-center justify-between'>
														<Typography
															variant='span'
															className='text-muted-foreground mb-2 line-clamp-1 text-sm break-words'>
															Descripción: {categoryData.description || 'Sin descripción'}
														</Typography>
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
														<Badge
															decord={false}
															variant={categoryData.status === 'active' ? 'success' : 'warning'}
															text={categoryData.status === 'active' ? 'Activo' : 'Inactivo'}
														/>

														<div className='text-muted-foreground text-right text-xs'>
															<TableInfoDate categoryData={categoryData} />
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
