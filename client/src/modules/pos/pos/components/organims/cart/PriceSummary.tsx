'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Typography } from '@/components/ui/typography'
import { formatPrice } from '@/common/utils/formatPrice-util'

interface PriceSummaryProps {
	subtotal: number
	tax: number
	total: number
	totalItems?: number
	receivedAmount?: string
	totalPaid?: number
	remainingAmount?: number
	changeAmount?: number
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
	subtotal,
	tax,
	total,
	receivedAmount,
	totalPaid = 0,
	remainingAmount = 0,
	changeAmount = 0,
}) => {
	const calculateChange = (): number => {
		if (receivedAmount) {
			const received = parseFloat(receivedAmount)
			return received - total
		}
		return changeAmount
	}

	const change = calculateChange()
	const received = receivedAmount ? parseFloat(receivedAmount) : totalPaid
	const hasMultiplePayments = totalPaid > 0 && !receivedAmount
	const isFullyPaid = hasMultiplePayments ? remainingAmount <= 0.01 : received >= total

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className='bg-accent-foreground/90 dark:bg-secondary space-y-1 rounded-2xl p-3'>
			{/* Mostrar detalles de pago - adaptado para múltiples pagos */}
			{hasMultiplePayments ? (
				<>
					{/* Total pagado */}
					<div className='flex justify-between text-sm'>
						<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
							Pagado
						</Typography>
						<Typography variant='small' className='font-mono font-medium text-emerald-500'>
							${formatPrice(totalPaid)}
						</Typography>
					</div>

					{/* Restante o cambio para múltiples pagos */}
					<div className='flex justify-between pb-1 text-sm'>
						<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
							{!isFullyPaid ? 'Falta' : 'Cambio'}
						</Typography>
						<Typography
							variant='small'
							className={cn('font-mono font-medium', !isFullyPaid ? 'text-orange-400' : 'text-blue-400')}>
							${formatPrice(!isFullyPaid ? remainingAmount : Math.abs(changeAmount))}
						</Typography>
					</div>
				</>
			) : (
				<>
					{/* Pago único tradicional */}
					<div className='flex justify-between text-sm'>
						<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
							Recibido
						</Typography>
						<Typography variant='small' className='font-mono font-medium text-emerald-500'>
							${formatPrice(received)}
						</Typography>
					</div>
					<div className='flex justify-between pb-1 text-sm'>
						<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
							Cambio
						</Typography>
						<Typography
							variant='small'
							className={cn('font-mono font-medium', change >= 0 ? 'text-blue-400' : 'text-destructive')}>
							${formatPrice(Math.abs(change))}
						</Typography>
					</div>
				</>
			)}

			{/* Subtotal */}
			<div className='flex justify-between text-sm'>
				<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
					Subtotal
				</Typography>
				<Typography variant='small' className='text-secondary dark:text-primary font-mono font-medium'>
					${formatPrice(subtotal)}
				</Typography>
			</div>

			{/* Impuestos */}
			<div className={cn('flex justify-between pb-2 text-sm')}>
				<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
					Impuestos
				</Typography>
				<Typography variant='small' className='text-secondary dark:text-primary font-mono font-medium'>
					${formatPrice(tax)}
				</Typography>
			</div>

			{/* Total */}
			<div className='dark:border-primary flex items-center justify-between border-t border-dashed pt-2'>
				<Typography variant='small' className='text-secondary dark:text-primary text-xl font-semibold'>
					Total
				</Typography>
				<Typography variant='small' className='text-secondary dark:text-primary font-mono text-2xl font-bold'>
					${formatPrice(total)}
				</Typography>
			</div>
		</motion.div>
	)
}
