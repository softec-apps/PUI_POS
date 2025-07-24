'use client'

import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

export type ViewType = 'table' | 'card' | 'list'

const viewOptions = [
	{
		key: 'table' as ViewType,
		label: 'Tabla',
		icon: <Icons.table />,
		description: 'Vista de tabla',
	},
	{
		key: 'card' as ViewType,
		label: 'Tarjetas',
		icon: <Icons.gridDots />,
		description: 'Vista de tarjetas',
	},
	{
		key: 'list' as ViewType,
		label: 'Lista',
		icon: <Icons.list />,
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
		<div className={`bg-card/50 flex items-center gap-1 rounded-2xl border border-dashed p-0.5 ${className}`}>
			{viewOptions.map(option => (
				<motion.div key={option.key} className='relative' whileHover={{ scale: 1 }} whileTap={{ scale: 1 }}>
					<ActionButton
						onClick={() => onViewChange?.(option.key)}
						icon={option.icon}
						size='icon'
						variant={currentView === option.key ? 'secondary' : 'ghost'}
						tooltip={option.description}
						disabled={!onViewChange}
					/>
				</motion.div>
			))}
		</div>
	)
}
