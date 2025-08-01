'use client'

import React from 'react'
import { PriceSummary } from '../cart/PriceSummary'

interface CheckoutSummaryProps {
	subtotal: number
	tax: number
	total: number
	totalItems: number
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ subtotal, tax, total, totalItems }) => (
	<div className='space-y-4'>
		<PriceSummary subtotal={subtotal} tax={tax} total={total} totalItems={totalItems} variant='detailed' />
	</div>
)
