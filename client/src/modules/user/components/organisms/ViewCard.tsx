'use client'

import { Icons } from '@/components/icons'
import { I_User } from '@/common/types/modules/user'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'
import { animations } from '@/modules/user/components/atoms/animations'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { UserRoleBadge } from '@/modules/user/components/atoms/UserRoleBadge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { UserStatusBadge } from '@/modules/user/components/atoms/UserStatusBadge'
import { TableActions } from '@/modules/user/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/user/components/organisms/Table/TableInfoDate'
import { Separator } from '@/components/ui/separator'

interface CardViewProps {
	recordsData: ReactTable<I_User>
	onEdit: (recordData: I_User) => void
	onHardDelete: (recordData: I_User) => void
}

export const CardView = ({ recordsData, onEdit, onHardDelete }: CardViewProps) => {
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
											<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
										</div>

										<div className='flex flex-col items-center justify-center gap-4'>
											<ImageControl
												recordData={recordData}
												enableHover={false}
												enableClick={false}
												imageHeight={120}
												imageWidth={120}
											/>

											<div className='flex items-center justify-center gap-2'>
												<UserStatusBadge status={recordData.status} />
												<UserRoleBadge role={recordData.role} />
											</div>
										</div>
									</CardHeader>

									{/* Contenido principal centrado */}
									<CardContent className='flex-grow px-4 text-center'>
										<div className='flex flex-col items-center justify-center space-y-3'>
											{/* Nombre completo */}
											<Typography variant='h5' className='line-clamp-1 font-semibold break-words'>
												{recordData.firstName} {recordData.lastName}
											</Typography>

											{/* Email con ícono */}
											<Typography variant='span' className='line-clamp-1 flex items-center gap-2 text-sm'>
												<Icons.mail className='h-4 w-4' />
												{recordData.email}
											</Typography>
										</div>
									</CardContent>

									{/* Footer con estado */}
									<CardFooter className='flex flex-none items-center justify-center p-4 pt-0'>
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
