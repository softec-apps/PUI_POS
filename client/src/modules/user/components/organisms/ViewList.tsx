'use client'

import Image from 'next/image'
import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Template } from '@/common/types/modules/template'
import { animations } from '@/modules/template/components/atoms/animations'
import { TableActions } from '@/modules/template/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/template/components/organisms/Table/TableInfoDate'

interface Props {
	table: ReactTable<I_Template>
	onEdit: (recordData: I_Template) => void
	onHardDelete: (recordData: I_Template) => void
}

export const ListView = ({ table, onEdit, onHardDelete }: Props) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-2 gap-4 space-y-4'
			layout>
			<AnimatePresence mode='sync'>
				{table.getRowModel().rows.map(row => {
					const recordData = row.original
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
										<div className='bg-muted/20 relative h-32 w-40 flex-shrink-0 rounded-xl'>
											{recordData?.category?.photo ? (
												<Image
													src={recordData?.category?.photo?.path}
													alt={recordData?.name}
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
															{recordData.name}
														</Typography>

														<div className='flex-shrink-0'>
															<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<div className='flex items-center justify-between'>
														<Typography
															variant='span'
															className='text-muted-foreground mb-2 line-clamp-1 text-sm break-words'>
															Descripción: {recordData.description || 'Sin descripción'}
														</Typography>

														<Typography
															variant='span'
															className='text-muted-foreground mb-2 line-clamp-1 text-sm break-words'>
															Descripción: {recordData.category?.name || '---'}
														</Typography>
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
														<Badge
															decord={false}
															variant='info'
															text={`${recordData.atributes?.length} atrib` || '0'}
														/>

														<div className='text-muted-foreground text-right text-xs'>
															<TableInfoDate recordData={recordData} />
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
