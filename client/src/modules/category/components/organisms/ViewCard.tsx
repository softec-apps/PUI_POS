'use client'

import React, { useState } from 'react'
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
import { Separator } from '@/components/ui/separator'

interface CardViewProps {
	table: ReactTable<I_Category>
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
}

export const CardView = ({ table, onEdit, onHardDelete }: CardViewProps) => {
	// Estado para controlar cuáles descripciones están expandidas
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

	const toggleExpand = (id: string) => {
		setExpandedIds(prev => {
			const newSet = new Set(prev)
			if (newSet.has(id)) newSet.delete(id)
			else newSet.add(id)
			return newSet
		})
	}

	return (
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
						const isExpanded = expandedIds.has(row.id)
						const description = categoryData.description || 'Sin descripción'
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
											<Badge
												variant={categoryData.status === 'active' ? 'success' : 'warning'}
												text={categoryData.status === 'active' ? 'Activo' : 'Inactivo'}
											/>

											<Typography variant='h5' className='line-clamp-1'>
												{categoryData.name}
											</Typography>

											<Typography
												variant='span'
												className={`text-muted-foreground flex-grow text-sm ${isExpanded ? '' : 'line-clamp-4'}`}>
												{description}
											</Typography>

											{/* Botón para expandir/contraer descripción */}
											{description.length > 100 && (
												<button
													type='button'
													onClick={() => toggleExpand(row.id)}
													className='text-primary mt-1 self-start text-xs hover:underline'>
													{isExpanded ? 'Ver menos' : 'Ver más'}
												</button>
											)}
										</div>
									</CardContent>

									<CardFooter className='flex flex-none items-center p-4 pt-0'>
										<TableInfoDate recordData={categoryData} />
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
