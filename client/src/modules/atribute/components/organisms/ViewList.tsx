'use client'

import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Attribute } from '@/common/types/modules/attribute'
import { animations } from '@/modules/atribute/components/atoms/animations'
import { TableActions } from '@/modules/atribute/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/atribute/components/organisms/Table/TableInfoDate'
import { Type, Hash, Calculator, DollarSign, Calendar, Clock, ToggleLeft } from 'lucide-react'
import { AttributeTypeAllow, typeLabelsTraslateToEs } from '@/modules/atribute/enums/attribute-types-allow.enum'

interface ListViewProps {
	table: ReactTable<I_Attribute>
	onEdit: (atributeData: I_Attribute) => void
	onHardDelete: (atributeData: I_Attribute) => void
}

// Mapeo de iconos por tipo de atributo
const getIconForAttributeType = (type: AttributeTypeAllow) => {
	const iconProps = { size: 24, className: 'text-muted-foreground' }

	switch (type) {
		case AttributeTypeAllow.TEXT:
			return <Type {...iconProps} />
		case AttributeTypeAllow.INTEGER:
			return <Hash {...iconProps} />
		case AttributeTypeAllow.BIGINT:
			return <Hash {...iconProps} />
		case AttributeTypeAllow.DECIMAL:
			return <Calculator {...iconProps} />
		case AttributeTypeAllow.MONEY:
			return <DollarSign {...iconProps} />
		case AttributeTypeAllow.DATE:
			return <Calendar {...iconProps} />
		case AttributeTypeAllow.TIMESTAMP:
			return <Clock {...iconProps} />
		case AttributeTypeAllow.TIME:
			return <Clock {...iconProps} />
		case AttributeTypeAllow.BOOLEAN:
			return <ToggleLeft {...iconProps} />
		default:
			return <Type {...iconProps} />
	}
}

// Colores de fondo por tipo de atributo
const getBackgroundColorForType = (type: AttributeTypeAllow) => {
	switch (type) {
		case AttributeTypeAllow.TEXT:
			return 'bg-blue-50 dark:bg-blue-950/20'
		case AttributeTypeAllow.INTEGER:
		case AttributeTypeAllow.BIGINT:
			return 'bg-green-50 dark:bg-green-950/20'
		case AttributeTypeAllow.DECIMAL:
		case AttributeTypeAllow.MONEY:
			return 'bg-emerald-50 dark:bg-emerald-950/20'
		case AttributeTypeAllow.DATE:
		case AttributeTypeAllow.TIMESTAMP:
		case AttributeTypeAllow.TIME:
			return 'bg-purple-50 dark:bg-purple-950/20'
		case AttributeTypeAllow.BOOLEAN:
			return 'bg-orange-50 dark:bg-orange-950/20'
		default:
			return 'bg-gray-50 dark:bg-gray-950/20'
	}
}

export const ListView = ({ table, onEdit, onHardDelete }: ListViewProps) => (
	<div className='space-y-4'>
		<motion.div
			initial='hidden'
			animate='visible'
			variants={animations.container}
			className='grid grid-cols-2 gap-4 space-y-4'
			layout>
			<AnimatePresence mode='sync'>
				{table.getRowModel().rows.map(row => {
					const atributeData = row.original
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
										<div
											className={`flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-lg ${getBackgroundColorForType(atributeData.type as AttributeTypeAllow)}`}>
											{getIconForAttributeType(atributeData.type as AttributeTypeAllow)}
										</div>

										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'>
												<div className='min-w-0 flex-1 space-y-3'>
													<div className='mb-1 flex items-start justify-between gap-2'>
														<Typography variant='h6' className='line-clamp-1 break-words'>
															{atributeData.name}
														</Typography>
														<div className='flex-shrink-0'>
															<TableActions atributeData={atributeData} onEdit={onEdit} onHardDelete={onHardDelete} />
														</div>
													</div>

													<div className='flex items-center justify-between'>
														<Typography
															variant='span'
															className='text-muted-foreground mb-2 line-clamp-1 text-sm break-words'>
															Tipo de dato: {typeLabelsTraslateToEs[atributeData.type as AttributeTypeAllow]}
														</Typography>

														{Array.isArray(row?.original?.options) && row.original.options.length > 0 ? (
															<>
																<Badge variant='info' text={`${atributeData.options?.length} opt`} decord={false} />
															</>
														) : null}
													</div>

													<Separator />

													<div className='flex items-center justify-between gap-2'>
														<Badge
															variant={atributeData.required ? 'success' : 'warning'}
															text={atributeData.required ? 'Requerido' : 'Opcional'}
														/>
														<div className='text-muted-foreground text-right text-xs'>
															<TableInfoDate atributeData={atributeData} />
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
