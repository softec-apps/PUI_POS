'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface StatusDropdownProps {
	currentStatus?: 1 | 2 | null
	onStatusChange: (status: 1 | 2 | null) => void
}

const STATUS_OPTIONS = [
	{ key: '', label: 'Todos', color: 'bg-accent-foreground/40' },
	{ key: 1, label: 'Activo', color: 'bg-green-500' },
	{ key: 2, label: 'Inactivo', color: 'bg-red-500' },
] as const

export function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
	const getCurrentStatusLabel = () => {
		if (!currentStatus) return 'Filtro'
		const statusLabels = {
			active: 1,
			inactive: 2,
		}
		return statusLabels[currentStatus] || 'Filtro'
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton icon={<Icons.filter />} text={getCurrentStatusLabel()} variant='ghost' />
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='end'
				className='border-border/50 bg-card/90 w-auto rounded-xl shadow-xl backdrop-blur-xl'>
				<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
					<Zap className='h-3 w-3' />
					Estado
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{STATUS_OPTIONS.map((status, index) => (
					<DropdownMenuItem
						key={status.key}
						onClick={() => onStatusChange(status.key as 1 | 2 | null)}
						className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
						<motion.div
							className='flex w-full items-center justify-between'
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}>
							<div className='flex items-center gap-2'>
								<motion.div
									className={`h-2 w-2 rounded-full ${status.color}`}
									whileHover={{ scale: 1.3 }}
									transition={{ type: 'spring', stiffness: 400 }}
								/>
								<span className={currentStatus === status.key ? 'text-primary font-medium' : ''}>{status.label}</span>
							</div>
							{currentStatus === status.key && (
								<motion.div
									className='bg-primary h-2 w-2 rounded-full'
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: 'spring', stiffness: 500 }}
								/>
							)}
						</motion.div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
