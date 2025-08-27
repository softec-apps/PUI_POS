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
import { IdentificationType, IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'

interface IdentificationTypeDropdownProps {
	currentIdentificationType?: IdentificationType | null
	onIdentificationTypeChange: (identificationType: IdentificationType | null) => void
}

const IDENTIFICATION_TYPE_OPTIONS = [
	{ key: IdentificationType.RUC, label: IdentificationTypeLabels_ES[IdentificationType.RUC], color: 'bg-blue-500' },
	{
		key: IdentificationType.IDENTIFICATION_CARD,
		label: IdentificationTypeLabels_ES[IdentificationType.IDENTIFICATION_CARD],
		color: 'bg-green-500',
	},
	{
		key: IdentificationType.PASSPORT,
		label: IdentificationTypeLabels_ES[IdentificationType.PASSPORT],
		color: 'bg-purple-500',
	},
	{
		key: IdentificationType.FINAL_CONSUMER,
		label: IdentificationTypeLabels_ES[IdentificationType.FINAL_CONSUMER],
		color: 'bg-orange-500',
	},
] as const

export function IdentificationTypeDropdown({
	currentIdentificationType,
	onIdentificationTypeChange,
}: IdentificationTypeDropdownProps) {
	const getCurrentIdentificationTypeLabel = () => {
		if (!currentIdentificationType) return 'Todos'
		const identificationTypeOption = IDENTIFICATION_TYPE_OPTIONS.find(
			option => option.key === currentIdentificationType
		)
		return identificationTypeOption?.label || 'Filtro'
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton icon={<Icons.filter />} text={getCurrentIdentificationTypeLabel()} variant='ghost' />
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='min-w-xs'>
				<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
					Tipo de identificación
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Opción para mostrar todos */}
				<DropdownMenuItem
					onClick={() => onIdentificationTypeChange(null)}
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
							<span className={!currentIdentificationType ? 'text-primary font-medium' : ''}>Todos</span>
						</div>
						{!currentIdentificationType && (
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

				{IDENTIFICATION_TYPE_OPTIONS.map((identificationType, index) => (
					<DropdownMenuItem
						key={identificationType.key}
						onClick={() => onIdentificationTypeChange(identificationType.key)}
						className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
						<motion.div
							className='flex w-full items-center justify-between'
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: (index + 1) * 0.05 }}>
							<div className='flex items-center gap-2'>
								<motion.div
									className={`h-2 w-2 rounded-full ${identificationType.color}`}
									whileHover={{ scale: 1.3 }}
									transition={{ type: 'spring', stiffness: 400 }}
								/>
								<span
									className={currentIdentificationType === identificationType.key ? 'text-primary font-medium' : ''}>
									{identificationType.label}
								</span>
							</div>
							{currentIdentificationType === identificationType.key && (
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
