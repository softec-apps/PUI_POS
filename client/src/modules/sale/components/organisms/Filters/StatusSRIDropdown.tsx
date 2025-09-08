'use client'

import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { StatusSRI, StatusSRILabels_ES } from '@/common/enums/sale.enum'

interface StatusSRIDropdownProps {
	currentStatusSRI?: StatusSRI | null
	onStatusSRIChange: (statusSRI: StatusSRI | null) => void
}

const STATUS_SRI_OPTIONS = [
	{
		key: StatusSRI.AUTHORIZED,
		label: StatusSRILabels_ES[StatusSRI.AUTHORIZED],
		color: 'bg-emerald-500',
	},
	{ key: StatusSRI.NO_ELECTRONIC, label: StatusSRILabels_ES[StatusSRI.NO_ELECTRONIC], color: 'bg-primary' },
	{
		key: StatusSRI.ERROR,
		label: StatusSRILabels_ES[StatusSRI.ERROR],
		color: 'bg-destructive',
	},
] as const

export function StatusSRIDropdown({ currentStatusSRI, onStatusSRIChange }: StatusSRIDropdownProps) {
	const getCurrentStatusSRILabel = () => {
		if (!currentStatusSRI) return 'Todos'
		const statusSRIOption = STATUS_SRI_OPTIONS.find(option => option.key === currentStatusSRI)
		return statusSRIOption?.label || 'Filtro'
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton icon={<Icons.filter />} text={getCurrentStatusSRILabel()} variant='ghost' />
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='min-w-xs'>
				<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
					Método de pago
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Opción para mostrar todos */}
				<DropdownMenuItem
					onClick={() => onStatusSRIChange(null)}
					className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
					<motion.div
						className='flex w-full items-center justify-between'
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}>
						<div className='flex items-center gap-2'>
							<motion.div
								className='h-2 w-2 rounded-full bg-slate-400'
								whileHover={{ scale: 1.3 }}
								transition={{ type: 'spring', stiffness: 400 }}
							/>
							<span className={!currentStatusSRI ? 'text-primary font-medium' : ''}>Todos</span>
						</div>
						{!currentStatusSRI && (
							<motion.div
								className='bg-primary h-2 w-2 rounded-full'
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', stiffness: 500 }}
							/>
						)}
					</motion.div>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{STATUS_SRI_OPTIONS.map((statusSRI, index) => (
					<DropdownMenuItem
						key={statusSRI.key}
						onClick={() => onStatusSRIChange(statusSRI.key)}
						className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
						<motion.div
							className='flex w-full items-center justify-between'
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: (index + 1) * 0.05 }}>
							<div className='flex items-center gap-2'>
								<motion.div
									className={`h-2 w-2 rounded-full ${statusSRI.color}`}
									whileHover={{ scale: 1.3 }}
									transition={{ type: 'spring', stiffness: 400 }}
								/>
								<span className={currentStatusSRI === statusSRI.key ? 'text-primary font-medium' : ''}>
									{statusSRI.label}
								</span>
							</div>
							{currentStatusSRI === statusSRI.key && (
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
