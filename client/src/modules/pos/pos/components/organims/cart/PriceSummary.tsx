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
	totalDiscountAmount?: number
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
	subtotal,
	tax,
	total,
	receivedAmount,
	totalPaid = 0,
	remainingAmount = 0,
	changeAmount = 0,
	totalDiscountAmount = 0,
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
	const isFullyPaid = hasMultiplePayments ? remainingAmount <= 0.0 : received >= total

	// Calcular subtotal antes de descuentos
	const subtotalBeforeDiscounts = subtotal + totalDiscountAmount

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className='bg-accent-foreground/85 dark:bg-secondary space-y-1 rounded-xl p-2'>
			{/* Mostrar detalles de pago */}
			<div className='bg-background flex w-full items-center justify-between rounded-lg p-2'>
				{/* Pago único tradicional */}
				<div className='flex justify-between gap-2 text-sm'>
					<Typography variant='small' className='text-primary font-medium'>
						Recibido
					</Typography>
					<Typography variant='small' className='font-mono font-medium text-emerald-500'>
						${formatPrice(received)}
					</Typography>
				</div>
				<div className='flex justify-between gap-2 text-sm'>
					<Typography variant='small' className='text-primary font-medium'>
						{!isFullyPaid ? 'Falta' : 'Cambio'}
					</Typography>
					<Typography
						variant='small'
						className={cn('font-mono font-medium', !isFullyPaid ? 'text-orange-500' : 'text-blue-400')}>
						${formatPrice(!isFullyPaid ? remainingAmount : Math.abs(changeAmount))}
					</Typography>
				</div>
			</div>

			{/* Subtotal después de descuentos */}
			<div className='flex justify-between pt-1 text-sm'>
				<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
					Subtotal
				</Typography>
				<div className='flex items-center gap-1'>
					<Typography variant='small' className='text-secondary dark:text-primary font-mono font-medium'>
						${formatPrice(subtotal)}
					</Typography>
					{subtotalBeforeDiscounts > subtotal && (
						<Typography
							variant='small'
							className='text-secondary/80 dark:text-primary/80 font-mono font-medium line-through'>
							${formatPrice(subtotalBeforeDiscounts)}
						</Typography>
					)}
				</div>
			</div>

			{/* Impuestos */}
			<div className={cn('flex justify-between text-sm')}>
				<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
					Impuestos
				</Typography>
				<Typography variant='small' className='text-secondary dark:text-primary font-mono font-medium'>
					${formatPrice(tax)}
				</Typography>
			</div>

			{/* Total de descuentos */}
			<div className='flex justify-between pb-2 text-sm'>
				<Typography variant='small' className='text-secondary dark:text-primary font-medium'>
					Descuentos
				</Typography>
				<Typography variant='small' className='font-mono font-medium text-emerald-500'>
					-${formatPrice(totalDiscountAmount)}
				</Typography>
			</div>

			{/* Total */}
			<div className='dark:border-primary flex items-center justify-between border-t border-dashed pt-1'>
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
