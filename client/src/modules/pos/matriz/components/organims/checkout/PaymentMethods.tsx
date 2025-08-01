'use client'

import React from 'react'
import { Check, CreditCard, DollarSign, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

interface PaymentMethod {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	description: string
}

interface PaymentMethodsProps {
	selectedPayment: string
	onSelectPayment: (paymentId: string) => void
}

const paymentMethods: PaymentMethod[] = [
	{
		id: 'cash',
		label: 'Efectivo',
		icon: DollarSign,
		description: 'Pago en efectivo',
	},
	{
		id: 'digital',
		label: 'Digital',
		icon: Smartphone,
		description: 'QR/Transferencia',
	},
	{
		id: 'card',
		label: 'Tarjeta',
		icon: CreditCard,
		description: 'Débito/Crédito',
	},
]

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ selectedPayment, onSelectPayment }) => (
	<div className='space-y-4'>
		<Typography variant='h6'>Método de pago</Typography>

		<div className='flex items-center justify-between gap-4'>
			{paymentMethods.map(method => (
				<Card
					key={method.id}
					className={cn(
						'hover:bg-accent/50 w-full cursor-pointer border-neutral-50 p-4 shadow-none transition-all duration-500',
						selectedPayment === method.id && 'bg-primary'
					)}
					onClick={() => onSelectPayment(method.id)}>
					<div className='flex items-center justify-center gap-3'>
						<method.icon className='h-5 w-5' />
					</div>

					<Typography variant='small' className='font-medium'>
						{method.label}
					</Typography>
				</Card>
			))}
		</div>
	</div>
)
