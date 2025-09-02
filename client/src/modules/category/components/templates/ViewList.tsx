'use client'

import { animations } from '@/lib/animations'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge } from '@/modules/category/components/atoms/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Category } from '@/common/types/modules/category'
import { Actions } from '@/modules/category/components/organisms/Actions'
import { InfoDate } from '@/modules/category/components/atoms/InfoDate'
import { ImageControl } from '@/components/layout/organims/ImageControl'

interface ListViewProps {
	recordsData: ReactTable<I_Category>
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
	onSoftDelete: (categoryData: I_Category) => void
	onRestore: (categoryData: I_Category) => void
}

export const ListView = ({ recordsData, onEdit, onHardDelete, onSoftDelete, onRestore }: ListViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-4 space-y-4'
			layout>
			<AnimatePresence mode='sync'>
				{recordsData.getRowModel().rows.map(row => {
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
							<Card className='dark:border-border/50 border px-4 shadow-none transition-all duration-500'>
								<CardContent className='p-0'>
									<div className='flex items-start space-x-4'>
										<ImageControl
											recordData={categoryData.photo}
											imageWidth={150}
											imageHeight={150}
											enableHover={false}
											enableClick={false}
										/>

										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-3'>
													<div className='mb-1 flex items-start justify-between gap-2'>
														<Typography variant='h6' className='line-clamp-1 break-words'>
															{categoryData.name}
														</Typography>

														<div className='flex-shrink-0'>
															<Actions
																recordData={categoryData}
																onEdit={onEdit}
																onHardDelete={onHardDelete}
																onSoftDelete={onSoftDelete}
																onRestore={onRestore}
															/>
														</div>
													</div>

													<div className='flex items-center justify-between'>
														<Typography
															variant='span'
															className='text-muted-foreground mb-2 line-clamp-2 text-sm break-words'>
															{categoryData.description || 'Sin descripción'}
														</Typography>
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
														<StatusBadge status={categoryData.status} />

														<div className='text-muted-foreground text-right text-xs'>
															<InfoDate recordData={categoryData} />
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
