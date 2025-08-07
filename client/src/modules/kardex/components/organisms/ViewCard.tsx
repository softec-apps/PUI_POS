'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'

import { I_Kardex } from '@/common/types/modules/kardex'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { animations } from '@/modules/kardex/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/kardex/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/kardex/components/organisms/Table/TableInfoDate'

interface Props {
	table: ReactTable<I_Kardex>
}

export const CardView = ({ table }: Props) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
			layout>
			<AnimatePresence mode='sync'>
				{table.getRowModel().rows.map(row => {
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
							<Card className='border-border/50 flex h-full flex-col overflow-hidden border p-0 transition-all duration-300'>
								<CardHeader className='flex-none p-0'>
									<div className='relative h-48 w-full'>
										<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
											<TableActions recordData={recordData} />
										</div>

										{recordData?.product?.photo ? (
											<Image
												src={recordData.product?.photo?.path}
												alt={recordData.product.name}
												fill
												unoptimized
												className='bg-muted rounded-t-xl object-cover'
											/>
										) : (
											<div className='bg-muted/50 flex h-full items-center justify-center'>
												<div className='text-muted-foreground flex flex-col items-center space-y-2'>
													<Icons.media className='h-12 w-12' />
												</div>
											</div>
										)}
									</div>
								</CardHeader>

								<CardContent className='flex-grow px-4'>
									<div className='flex h-full flex-col space-y-2'>
										<Typography variant='h5' className='line-clamp-1'>
											{recordData.product.code}
										</Typography>
									</div>
								</CardContent>

								<CardFooter className='flex flex-none items-center justify-between p-4 pt-0'>
									<div className='text-muted-foreground text-xs'>
										<TableInfoDate recordData={recordData} />
									</div>
								</CardFooter>
							</Card>
						</motion.div>
					)
				})}
			</AnimatePresence>
		</motion.div>
	</div>
)
