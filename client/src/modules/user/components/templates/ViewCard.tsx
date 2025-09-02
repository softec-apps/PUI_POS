'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'

import { animations } from '@/lib/animations'

import { I_User } from '@/common/types/modules/user'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { UserInfoDate } from '@/modules/user/components/atoms/UserInfoDate'
import { UserActions } from '@/modules/user/components/organisms/UserActions'
import { UserRoleBadge } from '@/modules/user/components/atoms/UserRoleBadge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { UserStatusBadge } from '@/modules/user/components/atoms/UserStatusBadge'

interface CardViewProps {
	recordsData: ReactTable<I_User>
	onEdit: (recordData: I_User) => void
	onSoftDelete: (recordData: I_User) => void
	onHardDelete: (recordData: I_User) => void
	onRestore: (recordData: I_User) => void
}

export const CardView = ({ recordsData, onEdit, onSoftDelete, onHardDelete, onRestore }: CardViewProps) => {
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
									{/* Header con imagen de perfil centrada */}
									<CardHeader className='relative flex-none p-0 pt-6'>
										{/* Botón de acciones en la esquina */}
										<div className='absolute top-4 right-4 z-10'>
											<UserActions
												recordData={recordData}
												onEdit={onEdit}
												onHardDelete={onHardDelete}
												onSoftDelete={onSoftDelete}
												onRestore={onRestore}
											/>
										</div>

										<div className='flex flex-col items-center justify-center gap-4'>
											<div className='space-y-4'>
												<div className='flex items-center justify-center'>
													<ImageControl
														recordData={recordData.photo}
														enableHover={false}
														enableClick={false}
														imageHeight={120}
														imageWidth={120}
													/>
												</div>

												<div className='flex items-center justify-center gap-2'>
													<UserStatusBadge status={recordData.status} />
													<UserRoleBadge role={recordData.role} />
												</div>

												<Typography variant='h5' className='line-clamp-1 font-semibold break-words'>
													{`${recordData.firstName?.split(' ')[0] || ''} ${recordData.lastName?.split(' ')[0] || ''}`}
												</Typography>
											</div>
										</div>
									</CardHeader>

									{/* Contenido principal centrado */}
									<CardContent className='flex-grow px-4'>
										<div className='flex flex-col justify-center space-y-2'>
											<Typography variant='span' className='line-clamp-1 flex items-center gap-2 text-sm'>
												<Icons.id className='h-4 w-4' />
												{recordData.dni}
											</Typography>

											<Typography variant='span' className='line-clamp-1 flex items-center gap-2 text-sm'>
												<Icons.mail className='h-4 w-4' />
												{recordData.email}
											</Typography>
										</div>
									</CardContent>

									{/* Footer con estado */}
									<CardFooter className='flex flex-none items-center p-4 pt-0'>
										<UserInfoDate recordData={recordData} />
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
