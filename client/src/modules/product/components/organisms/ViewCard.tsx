'use client'

import { Table as ReactTable } from '@tanstack/react-table'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Supplier } from '@/modules/supplier/types/supplier'
import { animations } from '@/modules/supplier/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/supplier/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/supplier/components/organisms/Table/TableInfoDate'

interface Props {
	recordsData: ReactTable<I_Supplier>
	onEdit: (recordData: I_Supplier) => void
	onHardDelete: (recordData: I_Supplier) => void
}

// Función para generar color sólido basado en el nombre
const generateBackgroundColor = (name: string): string => {
	const colors = [
		'#667eea',
		'#f093fb',
		'#4facfe',
		'#43e97b',
		'#fa709a',
		'#a8edea',
		'#ff9a9e',
		'#ffecd2',
		'#a18cd1',
		'#84fab0',
		'#fad0c4',
		'#d299c2',
		'#ff6b6b',
		'#4ecdc4',
		'#45b7d1',
		'#96ceb4',
		'#ffeaa7',
		'#dda0dd',
		'#98d8c8',
		'#f7dc6f',
		'#bb8fce',
		'#85c1e9',
	]

	let hash = 0
	for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
	return colors[Math.abs(hash) % colors.length]
}

export const CardView = ({ recordsData, onEdit, onHardDelete }: Props) => {
	const rows = recordsData.getRowModel().rows

	return (
		<div className='space-y-4'>
			<motion.div
				initial='hidden'
				animate='visible'
				variants={animations.container}
				className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
				layout>
				<AnimatePresence mode='sync'>
					{rows.map(row => {
						const recordData = row.original
						const backgroundColor = generateBackgroundColor(recordData.legalName)

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
								<Card className='border-border/50 flex h-full flex-col overflow-hidden p-0'>
									<CardHeader className='flex-none p-0'>
										<div className='relative flex h-32 w-full items-center justify-center'>
											{/* Ícono con fondo de color aleatorio */}
											<div className='flex h-32 w-full items-center justify-center' style={{ backgroundColor }}>
												<Icons.building className='text-muted h-12 w-12' />
											</div>

											{/* Acciones con mejor posicionamiento */}
											<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
												<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
											</div>
										</div>
									</CardHeader>

									<CardContent className='flex-grow px-4'>
										<div className='flex h-full flex-col space-y-3'>
											<Typography variant='h6'>{recordData.legalName}</Typography>

											<div className='flex flex-col space-y-2'>
												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.hash className='text-muted-foreground h-3 w-3' />
													</div>
													<Typography variant='small'>{recordData.ruc}</Typography>
												</div>

												<div className='flex items-center space-x-2'>
													<div className='flex h-5 w-5 items-center justify-center'>
														<Icons.store className='text-muted-foreground h-3 w-3' />
													</div>
													<Typography variant='small'>{recordData.commercialName || 'Sin nombre comercial'}</Typography>
												</div>
											</div>
										</div>
									</CardContent>

									<CardFooter className='flex flex-none items-center justify-between p-4'>
										<Badge
											decord={false}
											variant={row.original.status === 'active' ? 'success' : 'warning'}
											text={row.original.status === 'active' ? 'Activo' : 'Inactivo'}
										/>

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
