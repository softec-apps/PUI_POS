'use client'

import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Customer } from '@/common/types/modules/customer'
import { animations } from '@/modules/customer/components/atoms/animations'
import { TableActions } from '@/modules/customer/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/customer/components/organisms/Table/TableInfoDate'

interface ListViewProps {
	table: ReactTable<I_Customer>
	onEdit: (customerData: I_Customer) => void
	onHardDelete: (customerData: I_Customer) => void
}

export const ListView = ({ table, onEdit, onHardDelete }: ListViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-4'
			layout>
			<AnimatePresence mode='sync'>
				{table.getRowModel().rows.map(row => {
					const customerData = row.original
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
								<CardContent className='p-0 py-4'>
									<div className='flex items-center space-x-4'>
                                        <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
                                            <Icons.user className='h-5 w-5 text-muted-foreground' />
                                        </div>
										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-2'>
													<div className='mb-1 flex items-start justify-between gap-2'>
														<Typography variant='h6' className='line-clamp-1 break-words'>
															{customerData.firstName} {customerData.lastName}
														</Typography>
														<div className='flex-shrink-0'>
															<TableActions customerData={customerData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<div className='flex items-center justify-between'>
														<Typography
															variant='span'
															className='text-muted-foreground line-clamp-1 text-sm break-words'>
															{customerData.email || 'Sin email'}
														</Typography>
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
                                                        <Typography variant='span' className='text-muted-foreground text-sm'>
                                                            ID: {customerData.identificationNumber}
                                                        </Typography>
														<div className='text-muted-foreground text-right text-xs'>
															<TableInfoDate recordData={customerData} />
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
