'use client'

import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Brand } from '@/common/types/modules/brand'
import { animations } from '@/modules/brand/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/brand/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/brand/components/organisms/Table/TableInfoDate'
import { generateBackgroundColor } from '@/common/utils/generateColor-util'
import { Icons } from '@/components/icons'

interface CardViewProps {
	table: ReactTable<I_Brand>
	onEdit: (brandData: I_Brand) => void
	onHardDelete: (brandData: I_Brand) => void
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
					const recordData = row.original
					const backgroundColor = generateBackgroundColor(recordData.name)

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
									<div className='relative flex h-32 w-full items-center justify-center'>
										{/* Ícono con fondo de color aleatorio */}
										<div className='flex h-32 w-full items-center justify-center' style={{ backgroundColor }}>
											<Icons.trademark className='text-muted h-12 w-12' />
										</div>

										{/* Acciones con mejor posicionamiento */}
										<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
											<TableActions brandData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
										</div>
									</div>
								</CardHeader>

								<CardContent className='flex-grow'>
									<div className='flex h-full flex-col space-y-2'>
										<Typography variant='h5' className='line-clamp-1'>
											{recordData.name}
										</Typography>
										<Typography variant='span' className='text-muted-foreground line-clamp-2 flex-grow text-sm'>
											{recordData.description || 'Sin descripción'}
										</Typography>
									</div>
								</CardContent>

								<CardFooter className='flex flex-none items-center justify-between p-4 pt-0'>
									<Badge
										decord={false}
										variant={recordData.status === 'active' ? 'success' : 'warning'}
										text={recordData.status === 'active' ? 'Activo' : 'Inactivo'}
									/>

									<div className='text-muted-foreground text-xs'>
										<TableInfoDate brandData={recordData} />
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
