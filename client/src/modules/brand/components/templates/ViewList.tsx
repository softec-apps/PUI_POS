'use client'

import { animations } from '@/lib/animations'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge } from '@/modules/brand/components/atoms/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Brand } from '@/common/types/modules/brand'
import { Actions } from '@/modules/brand/components/organisms/Actions'
import { InfoDate } from '@/modules/brand/components/atoms/InfoDate'
import { Icons } from '@/components/icons'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'

interface ListViewProps {
	recordsData: ReactTable<I_Brand>
	onEdit: (recordData: I_Brand) => void
	onHardDelete: (recordData: I_Brand) => void
	onSoftDelete: (recordData: I_Brand) => void
	onRestore: (recordData: I_Brand) => void
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
					const recordData = row.original
					const backgroundColor = generateBackgroundColor(recordData.name)

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
										<div
											className='flex h-44 w-44 flex-shrink-0 items-center justify-center rounded-lg'
											style={{ backgroundColor }}>
											<Icons.brandMedium className='text-primary dark:text-primary-foreground h-12 w-12' />
										</div>

										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-4'>
												<div className='min-w-0 flex-1 space-y-3'>
													{/* Header con RUC y acciones */}
													<div className='flex items-start justify-between gap-4 pb-2'>
														<div className='flex items-center space-x-3'>
															<Typography variant='h5'>{recordData.name}</Typography>
														</div>

														<div className='flex-shrink-0'>
															<Actions
																recordData={recordData}
																onEdit={onEdit}
																onHardDelete={onHardDelete}
																onSoftDelete={onSoftDelete}
																onRestore={onRestore}
															/>
														</div>
													</div>
													{/* Información principal */}
													<div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
														<div className='space-y-1'>
															<div className='flex items-center space-x-2'>
																<Typography variant='small'>Descripción:</Typography>
															</div>
															<Typography variant='p' className='pl-6'>
																{recordData.description}
															</Typography>
														</div>
													</div>
													<Separator />
													{/* Footer con status y fecha */}
													<div className='flex items-center justify-between gap-4'>
														<StatusBadge status={recordData.status} />

														<InfoDate recordData={recordData} />
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
