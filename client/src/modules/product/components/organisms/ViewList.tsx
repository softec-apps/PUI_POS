'use client'

import { Table as ReactTable } from '@tanstack/react-table'

import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { I_Supplier } from '@/modules/supplier/types/supplier'
import { animations } from '@/modules/supplier/components/atoms/animations'
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
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash)
	}

	return colors[Math.abs(hash) % colors.length]
}

export const ListView = ({ recordsData, onEdit, onHardDelete }: Props) => {
	const rows = recordsData.getRowModel().rows

	return (
		<div className='space-y-4'>
			<motion.div initial='hidden' animate='visible' variants={animations.container} className='space-y-4' layout>
				<AnimatePresence mode='sync'>
					{rows.map(row => {
						const recordData = row.original
						const backgroundColor = generateBackgroundColor(recordData.legalName)

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
								<Card className='border-border/50 overflow-hidden p-0'>
									<CardContent className='p-4'>
										<div className='flex items-start space-x-4'>
											{/* Ícono con fondo de color aleatorio */}
											<div
												className='flex h-44 w-44 flex-shrink-0 items-center justify-center rounded-lg'
												style={{ backgroundColor }}>
												<Icons.building className='text-muted h-8 w-8 drop-shadow-sm' />
											</div>

											<div className='min-w-0 flex-1'>
												<div className='flex items-start justify-between gap-4'>
													<div className='min-w-0 flex-1 space-y-3'>
														{/* Header con RUC y acciones */}
														<div className='flex items-start justify-between gap-4 pb-2'>
															<div className='flex items-center space-x-3'>
																<Typography variant='h5'>{recordData.legalName}</Typography>
															</div>

															<div className='flex-shrink-0'>
																<TableActions recordData={recordData} onEdit={onEdit} onHardDelete={onHardDelete} />
															</div>
														</div>

														{/* Información principal */}
														<div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.hash className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>RUC:</Typography>
																</div>
																<Typography variant='p' className='pl-6'>
																	{recordData.ruc}
																</Typography>
															</div>

															<div className='space-y-1'>
																<div className='flex items-center space-x-2'>
																	<Icons.store className='text-muted-foreground h-4 w-4' />
																	<Typography variant='small'>Nombre Comercial:</Typography>
																</div>
																<Typography variant='p' className='pl-6'>
																	{recordData.commercialName || 'Sin nombre comercial'}
																</Typography>
															</div>
														</div>

														<Separator />

														{/* Footer con status y fecha */}
														<div className='flex items-center justify-between gap-4'>
															<Badge
																decord={false}
																variant={recordData.status === 'active' ? 'success' : 'warning'}
																text={recordData.status === 'active' ? 'Activo' : 'Inactivo'}
															/>

															<TableInfoDate recordData={recordData} />
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
}
