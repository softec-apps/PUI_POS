'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable } from '@tanstack/react-table'

import { I_Template } from '@/common/types/modules/template'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/layout/atoms/Badge'
import { animations } from '@/modules/template/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/template/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/template/components/organisms/Table/TableInfoDate'

interface Props {
	table: ReactTable<I_Template>
	onEdit: (recordData: I_Template) => void
	onHardDelete: (recordData: I_Template) => void
}

export const CardView = ({ table, onEdit, onHardDelete }: Props) => (
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
											<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
										</div>

										{recordData?.category?.photo ? (
											<Image
												src={recordData.category?.photo?.path}
												alt={recordData.name}
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
											{recordData.name}
										</Typography>

										<Typography variant='span' className='text-muted-foreground line-clamp-2 flex-grow text-sm'>
											{recordData.description || 'Sin descripción'}
										</Typography>

										<Typography variant='span' className='text-muted-foreground line-clamp-2 flex-grow text-sm'>
											Categoría: {recordData.category?.name || '---'}
										</Typography>
									</div>
								</CardContent>

								<CardFooter className='flex flex-none items-center justify-between p-4 pt-0'>
									<Badge variant='info' text={`${recordData.atributes?.length} Atrib` || '0'} decord={false} />

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
