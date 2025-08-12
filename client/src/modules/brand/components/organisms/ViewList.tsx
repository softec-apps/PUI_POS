'use client'

import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Brand } from '@/common/types/modules/brand'
import { animations } from '@/modules/brand/components/atoms/animations'
import { TableActions } from '@/modules/brand/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/brand/components/organisms/Table/TableInfoDate'
import { Icons } from '@/components/icons'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'

interface ListViewProps {
	table: ReactTable<I_Brand>
	onEdit: (brandData: I_Brand) => void
	onHardDelete: (brandData: I_Brand) => void
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
					const brandData = row.original
					const backgroundColor = generateBackgroundColor(brandData.name)

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
								<CardContent className='px-4'>
									<div className='flex items-start space-x-4'>
										<div
											className='flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg'
											style={{ backgroundColor }}>
											<Icons.truck className='text-muted h-12 w-12 drop-shadow-sm' />
										</div>
										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-3'>
													<div className='mb-1 flex items-start justify-between gap-2'>
														<Typography variant='h6' className='line-clamp-1 break-words'>
															{brandData.name}
														</Typography>

														<div className='flex-shrink-0'>
															<TableActions brandData={brandData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<div className='flex items-center justify-between'>
														<Typography
															variant='span'
															className='text-muted-foreground mb-2 line-clamp-1 text-sm break-words'>
															Descripción: {brandData.description || 'Sin descripción'}
														</Typography>
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
														<Badge
															variant={brandData.status === 'active' ? 'success' : 'warning'}
															text={brandData.status === 'active' ? 'Activo' : 'Inactivo'}
														/>

														<div className='text-muted-foreground text-right text-xs'>
															<TableInfoDate recordData={brandData} />
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
