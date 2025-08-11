'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Table, Grid3x3, List } from 'lucide-react'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

export type ViewType = 'table' | 'card' | 'list'

const viewOptions = [
	{
		key: 'table' as ViewType,
		label: 'Tabla',
		icon: Table,
		description: 'Vista de tabla',
	},
	{
		key: 'card' as ViewType,
		label: 'Tarjetas',
		icon: Grid3x3,
		description: 'Vista de tarjetas',
	},
	{
		key: 'list' as ViewType,
		label: 'Lista',
		icon: List,
		description: 'Vista de lista',
	},
]

interface ViewSelectorProps {
	currentView: ViewType
	onViewChange?: (view: ViewType) => void
	className?: string
}

export function ViewSelector({ currentView, onViewChange, className = '' }: ViewSelectorProps) {
	return (
		<div className={cn('bg-card/50 flex items-center gap-1 rounded-2xl border p-1', className)}>
			{viewOptions.map(option => {
				const IconComponent = option.icon
				const isActive = currentView === option.key

				return (
					<motion.div key={option.key}>
						<ActionButton
							onClick={() => onViewChange?.(option.key)}
							size='xs'
							variant={isActive ? 'secondary' : 'ghost'}
							disabled={!onViewChange}
							icon={<IconComponent className={isActive ? 'text-primary' : 'text-muted-foreground'} />}
							text={
								<>
									{isActive ? (
										<span className='text-primary'>{option.label}</span>
									) : (
										<span className='text-muted-foreground'>{option.label}</span>
									)}
								</>
							}
						/>
					</motion.div>
				)
			})}
		</div>
	)
}
