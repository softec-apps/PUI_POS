'use client'

import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Customer } from '@/common/types/modules/customer'
import { animations } from '@/lib/animations'
import { Actions } from '@/modules/customer/components/organisms/Actions'
import { InfoDate } from '@/modules/customer/components/atoms/InfoDate'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IdentificationTypeBadge } from '@/modules/customer/components/atoms/IdentificationTypeBadge'

interface ListViewProps {
	recordsData: ReactTable<I_Customer>
	onEdit: (record: I_Customer) => void
	onHardDelete: (record: I_Customer) => void
}

export const ListView = ({ recordsData, onEdit, onHardDelete }: ListViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-4'
			layout>
			<AnimatePresence mode='sync'>
				{recordsData.getRowModel().rows.map(row => {
					const recordData = row.original
					const initials = `${recordData?.firstName?.charAt(0)}${recordData?.lastName?.charAt(0)}`

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
							<Card className='dark:border-border/50 border p-0 px-4 shadow-none transition-all duration-500'>
								<CardContent className='p-0 py-4'>
									<div className='flex items-center space-x-4'>
										<Avatar className='h-28 w-28'>
											<AvatarImage src={recordData.firstName} />
											<AvatarFallback className='bg-primary text-primary-foreground'>{initials}</AvatarFallback>
										</Avatar>

										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-2'>
													<div className='mb-1 flex items-start justify-between gap-2'>
														<Typography variant='h6' className='line-clamp-1 break-words'>
															{recordData.firstName} {recordData.lastName}
														</Typography>
														<div className='flex-shrink-0'>
															<Actions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<div className='flex items-center gap-2'>
														<div className='flex items-center gap-2'>
															<Icons.id className='text-muted-foreground h-4 w-4' />
															<Typography variant='span' className='text-muted-foreground truncate text-sm'>
																{recordData.identificationNumber || 'No registrado'}
															</Typography>
														</div>

														<IdentificationTypeBadge identificationType={recordData.identificationType} />
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
														<div className='flex items-center gap-2'>
															<Icons.mail className='text-muted-foreground h-4 w-4' />
															<Typography variant='span' className='text-muted-foreground truncate text-sm'>
																{recordData.email || 'No registrado'}
															</Typography>
														</div>
														<div className='text-muted-foreground text-right text-xs'>
															<InfoDate recordData={recordData} />
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
