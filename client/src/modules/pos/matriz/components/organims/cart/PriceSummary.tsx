'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'

interface PriceSummaryProps {
	subtotal: number
	tax: number
	total: number
	totalItems?: number
	variant?: 'simple' | 'detailed'
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ subtotal, tax, total, totalItems, variant = 'simple' }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ delay: 0.2 }}
		className='space-y-3'>
		{variant === 'detailed' && totalItems && (
			<div className='flex justify-between text-sm'>
				<Typography variant='span'>Productos ({totalItems})</Typography>
				<Typography variant='span'>${subtotal.toFixed(2)}</Typography>
			</div>
		)}

		{variant === 'simple' && (
			<div className='flex justify-between text-sm'>
				<Typography variant='span'>Subtotal</Typography>
				<Typography variant='span'>${subtotal.toFixed(2)}</Typography>
			</div>
		)}

		<div className='flex justify-between text-sm'>
			<Typography variant='span'>IVA (15%)</Typography>
			<Typography variant='span'>${tax.toFixed(2)}</Typography>
		</div>

		<Separator />

		<div className='flex items-center justify-between'>
			<Typography variant='span' className={variant === 'detailed' ? 'font-semibold' : ''}>
				Total
			</Typography>
			<Typography variant='lead' className={`font-bold`}>
				${total.toFixed(2)}
			</Typography>
		</div>
	</motion.div>
)
