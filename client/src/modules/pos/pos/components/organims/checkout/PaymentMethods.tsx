'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { CreditCard, DollarSign, Smartphone, Calculator, Check } from 'lucide-react'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'

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
	receivedAmount?: string
	onReceivedAmountChange?: (value: string) => void
	totalAmount?: number
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
	receivedAmount,
	onReceivedAmountChange,
	totalAmount = 0,
}) => {
	const [showCalculator, setShowCalculator] = useState(false)
	const [calculatorValue, setCalculatorValue] = useState('')
	const [dialogOpen, setDialogOpen] = useState(false)
	const [tempSelectedPayment, setTempSelectedPayment] = useState(selectedPayment || '')
	const [tempReceivedAmount, setTempReceivedAmount] = useState(receivedAmount || '')
	const [tempTransferNumber, setTempTransferNumber] = useState(transferNumber || '')

	// Cálculo del cambio
	const receivedValue = parseFloat(tempReceivedAmount || '0')
	const changeAmount = receivedValue - totalAmount
	const needsChange = tempSelectedPayment === 'cash' && changeAmount > 0

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
			setTempReceivedAmount(calculatorValue)
			setShowCalculator(false)
			setCalculatorValue('')
		} else {
			setCalculatorValue(prev => prev + value)
		}
	}

	const handleOpenDialog = () => {
		setTempSelectedPayment(selectedPayment || '')
		setTempReceivedAmount(receivedAmount || '')
		setTempTransferNumber(transferNumber || '')
		setDialogOpen(true)
	}

	const handleCloseDialog = () => {
		setDialogOpen(false)
	}

	const handleAcceptSelection = () => {
		onSelectPayment(tempSelectedPayment)
		// Siempre guardar el monto recibido para todos los métodos de pago
		onReceivedAmountChange?.(tempReceivedAmount)
		// Solo guardar número de transferencia para métodos que no son efectivo
		if (tempSelectedPayment !== 'cash') {
			onTransferNumberChange?.(tempTransferNumber)
		}
		setDialogOpen(false)
	}

	return (
		<div className='space-y-4'>
			{/* Botón para abrir el diálogo de métodos de pago */}
			{!selectedPayment ? (
				<Button onClick={handleOpenDialog} className='w-full'>
					Seleccionar método de pago
				</Button>
			) : (
				<div className='space-y-3'>
					<Typography variant='h6'>Método de pago</Typography>

					<div className='flex items-center justify-between gap-4'>
						<Card className='bg-popover w-full p-2'>
							<div className='flex items-center gap-2'>
								{paymentMethods.find(m => m.id === selectedPayment)?.icon &&
									React.createElement(paymentMethods.find(m => m.id === selectedPayment)!.icon, {
										className: 'h-5 w-5',
									})}
								<Typography variant='small' className='font-medium'>
									{paymentMethods.find(m => m.id === selectedPayment)?.label}
								</Typography>
							</div>
						</Card>

						<ActionButton
							variant='secondary'
							size='lg'
							onClick={handleOpenDialog}
							icon={<Icons.moneyBag />}
							className='bg-amber-300/80 hover:bg-amber-400/80'
						/>
					</div>
				</div>
			)}

			{/* Diálogo con todos los métodos de pago */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>Método de pago</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Métodos de pago */}
						<div className='flex items-center justify-between gap-3'>
							{paymentMethods.map(method => (
								<Card
									key={method.id}
									className={cn(
										'w-full cursor-pointer p-4 transition-all duration-300 hover:scale-[1.02]',
										tempSelectedPayment === method.id
											? 'bg-primary text-primary-foreground border-primary shadow-lg'
											: 'hover:border-primary/50'
									)}
									onClick={() => setTempSelectedPayment(method.id)}>
									<div className='flex flex-col items-center gap-2'>
										<method.icon className='h-6 w-6' />
										<Typography
											variant='small'
											className={cn(
												'font-medium transition-colors duration-300',
												tempSelectedPayment === method.id ? 'text-primary-foreground' : 'text-muted-foreground'
											)}>
											{method.label}
										</Typography>
									</div>
								</Card>
							))}
						</div>

						{/* Campo de dinero recibido */}
						<div className='space-y-3'>
							<Typography variant='small' className='font-medium'>
								Dinero recibido
							</Typography>
							<div className='flex items-center gap-4'>
								<Input
									type='number'
									step='0.01'
									placeholder='0.00'
									className='h-17 text-center !text-2xl font-bold'
									value={tempReceivedAmount}
									onChange={e => setTempReceivedAmount(e.target.value)}
								/>

								<ActionButton
									variant='ghost'
									size='pos'
									onClick={() => setShowCalculator(true)}
									icon={<Icons.calculator className='!h-10 !w-10' />}
									className='bg-blue-500 hover:!bg-blue-400'
								/>
							</div>
						</div>

						{/* Campo para número de transferencia */}
						{tempSelectedPayment && tempSelectedPayment !== 'cash' && (
							<div className='space-y-2'>
								<Typography variant='small' className='font-medium'>
									{tempSelectedPayment === 'digital' ? 'Número de transferencia' : 'Número de autorización'}
								</Typography>
								<Input
									placeholder={tempSelectedPayment === 'digital' ? 'Ej: 123456789' : 'Ej: 001234'}
									value={tempTransferNumber}
									className='h-12 !text-lg'
									onChange={e => setTempTransferNumber(e.target.value)}
								/>
							</div>
						)}
					</div>

					{/* Botón de aceptar */}
					<DialogFooter>
						<DialogClose>
							<ActionButton size='pos' variant='secondary' text='Cancelar' />
						</DialogClose>

						<ActionButton size='pos' onClick={handleAcceptSelection} text='Aceptar' disabled={!tempSelectedPayment} />
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog de calculadora (se mantiene igual) */}
			<Dialog open={showCalculator} onOpenChange={setShowCalculator}>
				<DialogContent className='max-w-sm'>
					<div className='space-y-4'>
						{/* Display */}
						<div className='bg-muted rounded-lg p-4'>
							<Typography variant='overline' className='text-right font-mono text-2xl'>
								{calculatorValue || 0}
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
											{btn === 'OK' ? 'OK' : btn}
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
