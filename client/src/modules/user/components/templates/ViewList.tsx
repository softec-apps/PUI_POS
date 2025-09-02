'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'

import { I_User } from '@/common/types/modules/user'

import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'

import { animations } from '@/lib/animations'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { UserRoleBadge } from '@/modules/user/components/atoms/UserRoleBadge'
import { UserStatusBadge } from '@/modules/user/components/atoms/UserStatusBadge'
import { UserActions } from '@/modules/user/components/organisms/UserActions'
import { UserInfoDate } from '@/modules/user/components/atoms/UserInfoDate'
import { Icons } from '@/components/icons'

interface ListViewProps {
	recordsData: ReactTable<I_User>
	onEdit: (recordData: I_User) => void
	onSoftDelete: (recordData: I_User) => void
	onHardDelete: (recordData: I_User) => void
	onRestore: (recordData: I_User) => void
}

export const ListView = ({ recordsData, onEdit, onSoftDelete, onHardDelete, onRestore }: ListViewProps) => (
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
												recordData={recordData.photo}
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

															<div className='flex items-center gap-8'>
																<Typography variant='span' className='line-clamp-1 flex items-center gap-2 text-sm'>
																	<Icons.id className='h-4 w-4' />
																	{recordData.dni}
																</Typography>

																<Typography variant='span' className='line-clamp-1 flex items-center gap-2 text-sm'>
																	<Icons.mail className='h-4 w-4' />
																	{recordData.email}
																</Typography>
															</div>
														</div>

														<div className='flex-shrink-0'>
															<UserActions
																recordData={recordData}
																onEdit={onEdit}
																onSoftDelete={onSoftDelete}
																onHardDelete={onHardDelete}
																onRestore={onRestore}
															/>
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
															<UserInfoDate recordData={recordData} />
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
