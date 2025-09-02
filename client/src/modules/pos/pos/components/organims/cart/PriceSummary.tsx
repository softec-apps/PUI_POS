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
	selectedPayment?: string
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
	subtotal,
	tax,
	total,
	receivedAmount,
	selectedPayment,
}) => {
	const calculateChange = (): number => {
		if (receivedAmount) {
			const received = parseFloat(receivedAmount)
			return received - total
		}
		return 0
	}

	const change = calculateChange()
	const received = parseFloat(receivedAmount || '0')

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className='bg-popover space-y-1 rounded-2xl p-3'>
			{/* Mostrar detalles de pago para todos los métodos cuando hay método seleccionado */}
			<div className='flex justify-between text-sm'>
				<Typography variant='small' className='font-medium'>
					Recibido
				</Typography>
				<Typography variant='small' className='text-primary font-medium'>
					${formatPrice(received)}
				</Typography>
			</div>

			<div className='flex justify-between pb-1 text-sm'>
				<Typography variant='small' className='font-medium'>
					Cambio
				</Typography>
				<Typography variant='small' className={cn('font-medium', change >= 0 ? 'text-green-600' : 'text-red-600')}>
					${formatPrice(Math.abs(change))}
				</Typography>
			</div>

			<div className='flex justify-between text-sm'>
				<Typography variant='small'>Subtotal</Typography>
				<Typography variant='small' className='text-primary font-medium'>
					${formatPrice(subtotal)}
				</Typography>
			</div>

			<div className={cn('flex justify-between pb-2 text-sm')}>
				<Typography variant='small'>Impuestos</Typography>
				<Typography variant='small' className='text-primary font-medium'>
					${formatPrice(tax)}
				</Typography>
			</div>

			<div className='flex items-center justify-between border-t border-dashed pt-2'>
				<Typography variant='small' className='text-xl font-semibold'>
					Total
				</Typography>
				<Typography variant='small' className='text-primary text-2xl font-bold'>
					${formatPrice(total)}
				</Typography>
			</div>
		</motion.div>
	)
}
