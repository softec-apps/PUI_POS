'use client'

import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_User } from '@/modules/user/types/user'
import { animations } from '@/modules/user/components/atoms/animations'
import { TableActions } from '@/modules/user/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/user/components/organisms/Table/TableInfoDate'
import { UserStatusBadge } from '@/modules/user/components/atoms/UserStatusBadge'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { UserRoleBadge } from '../atoms/UserRoleBadge'

interface Props {
	recordsData: ReactTable<I_User>
	onEdit: (recordData: I_User) => void
	onHardDelete: (recordData: I_User) => void
}

export const ListView = ({ recordsData, onEdit, onHardDelete }: Props) => (
	<div className='space-y-4'>
		<motion.div initial='hidden' animate='visible' variants={animations.container} className='space-y-4' layout>
			<AnimatePresence mode='sync'>
				{recordsData.getRowModel().rows.map(row => {
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
							<Card className='border-border/50 overflow-hidden border p-0 shadow-none transition-all duration-300'>
								<CardContent className='p-4'>
									<div className='flex items-start space-x-4'>
										{/* Imagen del producto */}
										<div className='relative'>
											<ImageControl
												recordData={recordData}
												enableHover={false}
												enableClick={false}
												imageHeight={120}
												imageWidth={120}
											/>
										</div>

										{/* Información del producto */}
										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-3'>
													{/* Header: Título y acciones */}
													<div className='flex items-start justify-between gap-2'>
														<div className='min-w-0 flex-1'>
															<Typography variant='h6' className='mb-2 line-clamp-1 break-words'>
																{recordData.firstName} {recordData.lastName}
															</Typography>
															<div className='flex items-center gap-2'>
																<Typography variant='span' className='line-clamp-1 break-words'>
																	{recordData.email}
																</Typography>
															</div>
														</div>
														<div className='flex-shrink-0'>
															<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<Separator />

													{/* Footer: Status y fecha */}
													<div className='flex items-center justify-between gap-2'>
														<div className='space-x-2'>
															<UserStatusBadge status={recordData.status} />
															<UserRoleBadge role={recordData.role} />
														</div>

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
