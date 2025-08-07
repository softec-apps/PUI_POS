'use client'

import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/layout/atoms/Badge'
import { Table as ReactTable } from '@tanstack/react-table'
import { I_Attribute } from '@/common/types/modules/attribute'
import { animations } from '@/modules/atribute/components/atoms/animations'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TableActions } from '@/modules/atribute/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/atribute/components/organisms/Table/TableInfoDate'
import { AttributeTypeAllow, typeLabelsTraslateToEs } from '@/modules/atribute/enums/attribute-types-allow.enum'

import {
	Type,
	Hash,
	Calculator,
	DollarSign,
	Calendar,
	Clock,
	ToggleLeft,
	List,
	Braces,
	ListOrdered,
} from 'lucide-react'

interface CardViewProps {
	table: ReactTable<I_Attribute>
	onEdit: (atributeData: I_Attribute) => void
	onHardDelete: (atributeData: I_Attribute) => void
}

// Mapeo de iconos por tipo de atributo
const getIconForAttributeType = (type: AttributeTypeAllow) => {
	const iconProps = {
		size: 32,
		className: 'text-muted-foreground group-hover:text-primary transition-colors duration-300',
	}

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
		case AttributeTypeAllow.ENUM:
			return <List {...iconProps} />
		case AttributeTypeAllow.JSON:
			return <Braces {...iconProps} />
		case AttributeTypeAllow.ARRAY:
			return <ListOrdered {...iconProps} />
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
		case AttributeTypeAllow.ENUM:
			return 'bg-cyan-50 dark:bg-cyan-950/20'
		case AttributeTypeAllow.JSON:
			return 'bg-indigo-50 dark:bg-indigo-950/20'
		case AttributeTypeAllow.ARRAY:
			return 'bg-pink-50 dark:bg-pink-950/20'
		default:
			return 'bg-gray-50 dark:bg-gray-950/20'
	}
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
					const atributeData = row.original
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
							<Card className='border-border/50 flex h-full flex-col overflow-hidden border p-0 shadow-none transition-all duration-300'>
								<CardHeader className='flex-none p-0'>
									<div
										className={`relative flex h-32 w-full items-center justify-center ${getBackgroundColorForType(atributeData.type as AttributeTypeAllow)}`}>
										{getIconForAttributeType(atributeData.type as AttributeTypeAllow)}
										<div className='bg-card/50 shadow- absolute top-2 right-2 z-10 rounded-full backdrop-blur-sm'>
											<TableActions atributeData={atributeData} onEdit={onEdit} onHardDelete={onHardDelete} />
										</div>
									</div>
								</CardHeader>
								<CardContent className='flex-grow px-4'>
									<div className='flex h-full flex-col space-y-2'>
										<Typography variant='h5' className='line-clamp-1'>
											{atributeData.name}
										</Typography>

										<div className='flex items-center justify-between'>
											<Typography variant='span' className='text-muted-foreground line-clamp-2 flex-grow text-sm'>
												Dato: {typeLabelsTraslateToEs[atributeData.type as AttributeTypeAllow]}
											</Typography>
											{Array.isArray(row?.original?.options) && row.original.options.length > 0 ? (
												<>
													<Badge variant='info' text={`${atributeData.options?.length} opt`} decord={false} />
												</>
											) : null}
										</div>
									</div>
								</CardContent>
								<CardFooter className='flex flex-none items-center justify-between p-4 pt-0'>
									<Badge
										variant={row.original.required ? 'success' : 'warning'}
										text={row.original.required ? 'Requerido' : 'Opcional'}
									/>
									<div className='text-muted-foreground text-xs'>
										<TableInfoDate atributeData={atributeData} />
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
