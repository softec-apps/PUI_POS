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
import { PaymentMethod, PaymentMethodLabels_ES } from '@/common/enums/sale.enum'

interface PaymentMethodDropdownProps {
	currentPaymentMethod?: PaymentMethod | null
	onPaymentMethodChange: (paymentMethod: PaymentMethod | null) => void
}

const METHOD_PAYMENT_OPTIONS = [
	{ key: PaymentMethod.CARD, label: PaymentMethodLabels_ES[PaymentMethod.CARD], color: 'bg-cyan-500' },
	{
		key: PaymentMethod.CASH,
		label: PaymentMethodLabels_ES[PaymentMethod.CASH],
		color: 'bg-emerald-500',
	},
	{
		key: PaymentMethod.DIGITAL,
		label: PaymentMethodLabels_ES[PaymentMethod.DIGITAL],
		color: 'bg-blue-500',
	},
] as const

export function PaymentMethodDropdown({ currentPaymentMethod, onPaymentMethodChange }: PaymentMethodDropdownProps) {
	const getCurrentPaymentMethodLabel = () => {
		if (!currentPaymentMethod) return 'Todos'
		const paymentMethodOption = METHOD_PAYMENT_OPTIONS.find(option => option.key === currentPaymentMethod)
		return paymentMethodOption?.label || 'Filtro'
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton icon={<Icons.filter />} text={getCurrentPaymentMethodLabel()} variant='ghost' />
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='min-w-xs'>
				<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
					Método de pago
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Opción para mostrar todos */}
				<DropdownMenuItem
					onClick={() => onPaymentMethodChange(null)}
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
							<span className={!currentPaymentMethod ? 'text-primary font-medium' : ''}>Todos</span>
						</div>
						{!currentPaymentMethod && (
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

				{METHOD_PAYMENT_OPTIONS.map((paymentMethod, index) => (
					<DropdownMenuItem
						key={paymentMethod.key}
						onClick={() => onPaymentMethodChange(paymentMethod.key)}
						className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
						<motion.div
							className='flex w-full items-center justify-between'
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: (index + 1) * 0.05 }}>
							<div className='flex items-center gap-2'>
								<motion.div
									className={`h-2 w-2 rounded-full ${paymentMethod.color}`}
									whileHover={{ scale: 1.3 }}
									transition={{ type: 'spring', stiffness: 400 }}
								/>
								<span className={currentPaymentMethod === paymentMethod.key ? 'text-primary font-medium' : ''}>
									{paymentMethod.label}
								</span>
							</div>
							{currentPaymentMethod === paymentMethod.key && (
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
