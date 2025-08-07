'use client'

import Image from 'next/image'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Category } from '@/common/types/modules/category'
import { animations } from '@/modules/category/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/category/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/category/components/organisms/Table/TableInfoDate'

interface CardViewProps {
	table: ReactTable<I_Category>
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
}

export const CardView = ({ table, onEdit, onHardDelete }: CardViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
			layout>
			<AnimatePresence mode='sync'>
				{table.getRowModel().rows.map(row => {
					const categoryData = row.original
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
											<TableActions categoryData={categoryData} onEdit={onEdit} onHardDelete={onHardDelete} />
										</div>

										{categoryData?.photo ? (
											<Image
												src={categoryData.photo.path}
												alt={categoryData.name}
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
											{categoryData.name}
										</Typography>
										<Typography variant='span' className='text-muted-foreground line-clamp-2 flex-grow text-sm'>
											{categoryData.description || 'Sin descripción'}
										</Typography>
									</div>
								</CardContent>

								<CardFooter className='flex flex-none items-center justify-between p-4 pt-0'>
									<Badge
										decord={false}
										variant={categoryData.status === 'active' ? 'success' : 'warning'}
										text={categoryData.status === 'active' ? 'Activo' : 'Inactivo'}
									/>

									<div className='text-muted-foreground text-xs'>
										<TableInfoDate categoryData={categoryData} />
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
