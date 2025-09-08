'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
	DialogDescription,
} from '@/components/ui/dialog'
import { CreditCard, DollarSign, Smartphone, Calculator, Check, X, Plus } from 'lucide-react'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'
import { formatPrice } from '@/common/utils/formatPrice-util'

interface PaymentMethod {
	id: string
	label: string
	icon: React.ComponentType<{ className?: string }>
	description: string
}

interface PaymentEntry {
	id: string
	method: string
	amount: number
	transferNumber?: string
	timestamp: number
}

interface PaymentMethodsProps {
	payments: PaymentEntry[]
	onPaymentsChange: (payments: PaymentEntry[]) => void
	totalAmount: number
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

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ payments, onPaymentsChange, totalAmount }) => {
	const [showCalculator, setShowCalculator] = useState(false)
	const [calculatorValue, setCalculatorValue] = useState('')
	const [dialogOpen, setDialogOpen] = useState(false)
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
	const [paymentAmount, setPaymentAmount] = useState('')
	const [transferNumber, setTransferNumber] = useState('')

	// Cálculos
	const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
	const remainingAmount = totalAmount - totalPaid
	const isFullyPaid = remainingAmount <= 0.01 // Tolerancia para centavos
	const changeAmount = remainingAmount < 0 ? Math.abs(remainingAmount) : 0

	// Calculadora simple
	const handleCalculatorClick = (value: string) => {
		if (value === 'C') {
			setCalculatorValue('')
		} else if (value === '=') {
			try {
				const result = eval(calculatorValue)
				setCalculatorValue(result.toString())
			} catch {
				setCalculatorValue('')
			}
		} else if (value === 'OK') {
			setPaymentAmount(calculatorValue)
			setShowCalculator(false)
			setCalculatorValue('')
		} else {
			setCalculatorValue(prev => prev + value)
		}
	}

	const handleOpenDialog = () => {
		setSelectedPaymentMethod('')
		setPaymentAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : '')
		setTransferNumber('')
		setDialogOpen(true)
	}

	const handleAddPayment = () => {
		const amount = parseFloat(paymentAmount || '0')
		if (!selectedPaymentMethod || amount <= 0) return

		const newPayment: PaymentEntry = {
			id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			method: selectedPaymentMethod,
			amount: amount,
			timestamp: Date.now(),
			...(selectedPaymentMethod !== 'cash' &&
				transferNumber.trim() && {
					transferNumber: transferNumber.trim(),
				}),
		}

		onPaymentsChange([...payments, newPayment])

		// Reset form
		setSelectedPaymentMethod('')
		setPaymentAmount('')
		setTransferNumber('')
		setDialogOpen(false)
	}

	const handleRemovePayment = (paymentId: string) => {
		onPaymentsChange(payments.filter(payment => payment.id !== paymentId))
	}

	const getMethodInfo = (methodId: string) => {
		return paymentMethods.find(method => method.id === methodId)
	}

	const handleQuickAmount = (percentage: number) => {
		const amount = ((remainingAmount * percentage) / 100).toFixed(2)
		setPaymentAmount(amount)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<Typography variant='h6'>Métodos de pago</Typography>
				{!isFullyPaid && (
					<ActionButton
						variant='secondary'
						size='sm'
						onClick={handleOpenDialog}
						icon={<Plus className='h-4 w-4' />}
						text='Agregar'
					/>
				)}
			</div>

			{/* Lista de pagos agregados */}
			{payments.length > 0 && (
				<div className='bg-popover divide-y rounded-2xl'>
					{payments.map(payment => {
						const methodInfo = getMethodInfo(payment.method)
						return (
							<div key={payment.id}>
								<div className='flex items-center justify-between p-2'>
									<div className='flex items-center gap-3'>
										{methodInfo?.icon && React.createElement(methodInfo.icon, { className: 'h-5 w-5' })}
										<div>
											<Typography variant='small' className='font-medium'>
												{methodInfo?.label}
											</Typography>
											{payment.transferNumber && (
												<Typography variant='muted' className='text-xs'>
													{payment.transferNumber}
												</Typography>
											)}
										</div>
									</div>

									<div className='flex items-center gap-2'>
										<Typography variant='small' className='font-mono font-bold'>
											${formatPrice(payment.amount)}
										</Typography>

										<ActionButton
											variant='ghost'
											size='icon'
											onClick={() => handleRemovePayment(payment.id)}
											icon={<X className='h-4 w-4' />}
											className='text-destructive hover:text-destructive'
										/>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			)}

			{/* Diálogo para agregar nuevo pago */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Agregar método de pago</DialogTitle>
						<DialogDescription>Restante: ${formatPrice(remainingAmount)}</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Métodos de pago */}
						<div className='space-y-2'>
							<Typography variant='small' className='font-medium'>
								Seleccionar método
							</Typography>
							<div className='flex items-center gap-2'>
								{paymentMethods.map(method => (
									<Card
										key={method.id}
										className={cn(
											'flex-1 cursor-pointer p-3 transition-all duration-300',
											selectedPaymentMethod === method.id
												? 'bg-primary text-primary-foreground border-primary shadow-lg'
												: 'hover:border-primary/50'
										)}
										onClick={() => setSelectedPaymentMethod(method.id)}>
										<div className='flex flex-col items-center gap-1'>
											<method.icon className='h-5 w-5' />
											<Typography
												variant='span'
												className={cn(
													'font-medium transition-colors duration-300',
													selectedPaymentMethod === method.id ? 'text-primary-foreground' : 'text-muted-foreground'
												)}>
												{method.label}
											</Typography>
										</div>
									</Card>
								))}
							</div>
						</div>

						{/* Botones de monto rápido */}
						{remainingAmount > 0 && (
							<div className='space-y-2'>
								<Typography variant='small' className='font-medium'>
									Monto rápido
								</Typography>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm' onClick={() => handleQuickAmount(100)} className='flex-1'>
										100%
									</Button>
									<Button variant='outline' size='sm' onClick={() => handleQuickAmount(50)} className='flex-1'>
										50%
									</Button>
									<Button variant='outline' size='sm' onClick={() => handleQuickAmount(25)} className='flex-1'>
										25%
									</Button>
								</div>
							</div>
						)}

						{/* Campo de monto */}
						<div className='space-y-2'>
							<Typography variant='small' className='font-medium'>
								Monto a pagar
							</Typography>
							<div className='flex items-center gap-2'>
								<Input
									type='number'
									step='0.01'
									placeholder='0.00'
									className='h-12 text-center !text-xl font-bold'
									value={paymentAmount}
									onChange={e => setPaymentAmount(e.target.value)}
								/>
								<ActionButton
									variant='ghost'
									size='lg'
									onClick={() => setShowCalculator(true)}
									icon={<Calculator className='h-5 w-5' />}
									className='bg-blue-500 hover:bg-blue-400'
								/>
							</div>
						</div>

						{/* Campo para número de transferencia/autorización */}
						{selectedPaymentMethod && selectedPaymentMethod !== 'cash' && (
							<div className='space-y-2'>
								<Typography variant='small' className='font-medium'>
									{selectedPaymentMethod === 'digital' ? 'Número de transferencia' : 'Número de autorización'}{' '}
									(requerido)
								</Typography>
								<Input
									placeholder={selectedPaymentMethod === 'digital' ? 'Ej: 123456789' : 'Ej: 001234'}
									value={transferNumber}
									className='h-10'
									onChange={e => setTransferNumber(e.target.value)}
								/>
							</div>
						)}
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant='ghost'>Cancelar</Button>
						</DialogClose>
						<Button
							onClick={handleAddPayment}
							disabled={!selectedPaymentMethod || !paymentAmount || parseFloat(paymentAmount || '0') <= 0}>
							Agregar pago
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog de calculadora */}
			<Dialog open={showCalculator} onOpenChange={setShowCalculator}>
				<DialogContent className='max-w-sm'>
					<div className='space-y-4'>
						{/* Display */}
						<div className='bg-muted rounded-lg p-4'>
							<Typography variant='overline' className='text-right font-mono text-2xl'>
								{calculatorValue || '0'}
							</Typography>
						</div>

						{/* Botones */}
						<div className='grid grid-cols-4 gap-2'>
							{['C', '/', '*', '+', '7', '8', '9', '-', '4', '5', '6', '=', '1', '2', '3', '', '0', '.', 'OK', ''].map(
								(btn, idx) => {
									if (!btn) return <div key={idx}></div>

									const isOperator = ['/', '*', '-', '+', '='].includes(btn)
									const isSpecial = ['C', 'OK'].includes(btn)

									return (
										<Button
											key={btn}
											variant={isSpecial ? 'default' : isOperator ? 'secondary' : 'outline'}
											className={cn(
												'h-12 text-lg font-semibold',
												btn === '0' && 'col-span-1',
												btn === 'OK' &&
													'col-span-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
											)}
											onClick={() => handleCalculatorClick(btn)}>
											{btn}
										</Button>
									)
								}
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
