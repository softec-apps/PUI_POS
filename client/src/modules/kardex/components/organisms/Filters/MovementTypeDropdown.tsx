'use client'

import { motion } from 'framer-motion'
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

const enum KardexMovementTypeEnum {
	PURCHASE = 'purchase',
	RETURN_IN = 'return_in',
	TRANSFER_IN = 'transfer_in',
	SALE = 'sale',
	RETURN_OUT = 'return_out',
	TRANSFER_OUT = 'transfer_out',
	ADJUSTMENT_IN = 'adjustment_in',
	ADJUSTMENT_OUT = 'adjustment_out',
	DAMAGED = 'damaged',
	EXPIRED = 'expired',
}

interface MovementTypeDropdownProps {
	currentMovementType?: KardexMovementTypeEnum | null
	onMovementTypeChange: (movementType: KardexMovementTypeEnum | null) => void
}

const MOVEMENT_TYPE_OPTIONS = [
	{ key: KardexMovementTypeEnum.PURCHASE, label: 'Compra', color: 'bg-green-500' },
	{ key: KardexMovementTypeEnum.RETURN_IN, label: 'Devolución de cliente', color: 'bg-blue-500' },
	{ key: KardexMovementTypeEnum.TRANSFER_IN, label: 'Transferencia entrante', color: 'bg-cyan-500' },
	{ key: KardexMovementTypeEnum.SALE, label: 'Venta', color: 'bg-emerald-500' },
	{ key: KardexMovementTypeEnum.RETURN_OUT, label: 'Devolución a proveedor', color: 'bg-orange-500' },
	{ key: KardexMovementTypeEnum.TRANSFER_OUT, label: 'Transferencia saliente', color: 'bg-amber-500' },
	{ key: KardexMovementTypeEnum.ADJUSTMENT_IN, label: 'Ajuste positivo', color: 'bg-teal-500' },
	{ key: KardexMovementTypeEnum.ADJUSTMENT_OUT, label: 'Ajuste negativo', color: 'bg-red-500' },
	{ key: KardexMovementTypeEnum.DAMAGED, label: 'Dañado', color: 'bg-gray-500' },
	{ key: KardexMovementTypeEnum.EXPIRED, label: 'Vencido', color: 'bg-purple-500' },
] as const

export function MovementTypeDropdown({ currentMovementType, onMovementTypeChange }: MovementTypeDropdownProps) {
	const getCurrentMovementTypeLabel = () => {
		if (!currentMovementType) return 'Todos'
		const movementTypeOption = MOVEMENT_TYPE_OPTIONS.find(option => option.key === currentMovementType)
		return movementTypeOption?.label || 'Filtro'
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton icon={<Icons.filter />} text={getCurrentMovementTypeLabel()} variant='ghost' />
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='min-w-xs'>
				<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
					Tipo de movimiento
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Opción para mostrar todos */}
				<DropdownMenuItem
					onClick={() => onMovementTypeChange(null)}
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
							<span className={!currentMovementType ? 'text-primary font-medium' : ''}>Todos</span>
						</div>
						{!currentMovementType && (
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

				{MOVEMENT_TYPE_OPTIONS.map((movementType, index) => (
					<DropdownMenuItem
						key={movementType.key}
						onClick={() => onMovementTypeChange(movementType.key)}
						className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
						<motion.div
							className='flex w-full items-center justify-between'
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: (index + 1) * 0.05 }}>
							<div className='flex items-center gap-2'>
								<motion.div
									className={`h-2 w-2 rounded-full ${movementType.color}`}
									whileHover={{ scale: 1.3 }}
									transition={{ type: 'spring', stiffness: 400 }}
								/>
								<span className={currentMovementType === movementType.key ? 'text-primary font-medium' : ''}>
									{movementType.label}
								</span>
							</div>
							{currentMovementType === movementType.key && (
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
