'use client'

import Image from 'next/image'
import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Kardex } from '@/common/types/modules/kardex'
import { animations } from '@/modules/kardex/components/atoms/animations'
import { TableActions } from '@/modules/kardex/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/kardex/components/organisms/Table/TableInfoDate'

interface ListViewProps {
	table: ReactTable<I_Kardex>
}

export const ListView = ({ table }: ListViewProps) => (
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
											{recordData?.product?.photo ? (
												<Image
													src={recordData?.product?.photo?.path}
													alt={recordData?.product?.name}
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
															{recordData.product.code}
														</Typography>

														<div className='flex-shrink-0'>
															<TableActions recordData={recordData} />
														</div>
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
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
