'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Input } from '@/components/ui/input'
import { CreditCard, DollarSign, Smartphone } from 'lucide-react'

interface PaymentMethod {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	description: string
}

interface PaymentMethodsProps {
	selectedPayment: string
	onSelectPayment: (paymentId: string) => void
	transferNumber?: string
	onTransferNumberChange?: (value: string) => void
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

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
	selectedPayment,
	onSelectPayment,
	transferNumber,
	onTransferNumberChange,
}) => (
	<div className='space-y-4 px-1'>
		<Typography variant='lead'>Método de pago</Typography>

		<div className='flex items-center justify-between gap-4'>
			{paymentMethods.map(method => (
				<Card
					key={method.id}
					className={cn(
						'hover:bg-accent/50 w-full cursor-pointer border-none p-4 shadow-none transition-all duration-500',
						selectedPayment === method.id && 'bg-primary text-primary-foreground'
					)}
					onClick={() => onSelectPayment(method.id)}>
					<div className='flex flex-col items-center gap-2'>
						<method.icon className='h-5 w-5' />
						<Typography
							variant='span'
							className={cn(
								'font-medium transition-colors duration-300',
								selectedPayment === method.id ? 'text-primary-foreground' : 'text-muted-foreground'
							)}>
							{method.label}
						</Typography>
					</div>
				</Card>
			))}
		</div>

		{/* Mostrar input solo si no es efectivo */}
		{selectedPayment !== 'cash' && (
			<div className='space-y-2'>
				<Typography variant='small' className='font-medium'>
					Número de transferencia
				</Typography>
				<Input
					placeholder='Ingrese el número de comprobante'
					value={transferNumber || ''}
					onChange={e => onTransferNumberChange?.(e.target.value)}
				/>
			</div>
		)}
	</div>
)
