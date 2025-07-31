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
		id: 'card',
		label: 'Tarjeta',
		icon: CreditCard,
		description: 'Débito/Crédito',
	},
	{
		id: 'digital',
		label: 'Digital',
		icon: Smartphone,
		description: 'QR/Transferencia',
	},
]

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ selectedPayment, onSelectPayment }) => (
	<div className='space-y-4'>
		<Typography variant='h6'>Método de pago</Typography>
		<div className='grid grid-cols-1 gap-2'>
			{paymentMethods.map(method => (
				<Card
					key={method.id}
					className={cn(
						'hover:bg-accent/50 cursor-pointer p-4 transition-all duration-200',
						selectedPayment === method.id && 'bg-primary/10 border-primary/50'
					)}
					onClick={() => onSelectPayment(method.id)}>
					<div className='flex items-center gap-3'>
						<method.icon className='h-5 w-5' />
						<div className='flex-1'>
							<Typography variant='small' className='font-medium'>
								{method.label}
							</Typography>
							<Typography variant='small' className='text-muted-foreground'>
								{method.description}
							</Typography>
						</div>
						{selectedPayment === method.id && <Check className='text-primary h-5 w-5' />}
					</div>
				</Card>
			))}
		</div>
	</div>
)
