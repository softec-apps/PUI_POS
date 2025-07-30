'use client'

import { Icons } from '@/components/icons'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, DollarSign, Smartphone } from 'lucide-react'

interface OrderItem {
	id: string
	name: string
	price: number
	quantity: number
}

interface Customer {
	id: string
	name: string
	email?: string
	phone?: string
}

export const CartSidebar: React.FC<{
	isOpen: boolean
	onClose: () => void
	orderItems: OrderItem[]
	onUpdateQuantity: (id: string, change: number) => void
	onRemoveItem: (id: string) => void
	selectedPayment: string
	onSelectPayment: (paymentId: string) => void
	onPlaceOrder: () => void
	customer?: Customer
}> = ({
	isOpen,
	onClose,
	orderItems,
	onUpdateQuantity,
	onRemoveItem,
	selectedPayment,
	onSelectPayment,
	onPlaceOrder,
	customer,
}) => {
	const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	const tax = subtotal * 0.16
	const total = subtotal + tax

	const paymentMethods = [
		{ id: 'cash', label: 'Efectivo', icon: DollarSign },
		{ id: 'card', label: 'Tarjeta', icon: CreditCard },
		{ id: 'digital', label: 'Digital', icon: Smartphone },
	]

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='bg-background/80 fixed inset-0 z-40 backdrop-blur-sm lg:hidden'
						onClick={onClose}
					/>

					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className='fixed top-0 right-0 z-50 flex h-full w-80 flex-col border-l lg:relative lg:border-0 lg:shadow-none'>
						<div className='flex items-center justify-between border-b p-4'>
							<div>
								<h2 className='font-semibold'>Carrito</h2>
								{customer && <p className='text-muted-foreground text-sm'>{customer.name}</p>}
							</div>

							<ActionButton variant='ghost' size='sm' onClick={onClose} icon={<Icons.x />} />
						</div>

						<div className='flex-1 space-y-3 overflow-y-auto p-4'>
							<AnimatePresence>
								{orderItems.map(item => (
									<motion.div
										key={item.id}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20, scale: 0.95 }}
										layout>
										<Card className='border-border/50'>
											<CardContent className='p-3'>
												<div className='flex items-center justify-between gap-3'>
													<div className='min-w-0 flex-1'>
														<h4 className='truncate text-sm font-medium'>{item.name}</h4>
														<p className='text-muted-foreground text-xs'>${item.price.toFixed(2)} c/u</p>
													</div>

													<ActionButton
														variant='ghost'
														size='sm'
														onClick={() => onRemoveItem(item.id)}
														icon={<Icons.trash />}
													/>
												</div>

												<div className='mt-2 flex items-center justify-between'>
													<div className='flex items-center rounded-md border'>
														<ActionButton
															variant='ghost'
															size='sm'
															onClick={() => onUpdateQuantity(item.id, -1)}
															icon={<Icons.pencilMinus />}
														/>

														<span className='min-w-[1.5rem] px-2 py-1 text-center text-xs font-medium'>
															{item.quantity}
														</span>

														<ActionButton
															variant='ghost'
															size='sm'
															onClick={() => onUpdateQuantity(item.id, 1)}
															icon={<Icons.plus />}
														/>
													</div>
													<span className='text-sm font-semibold'>${(item.price * item.quantity).toFixed(2)}</span>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</AnimatePresence>

							{orderItems.length === 0 && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className='flex flex-col items-center justify-center py-12 text-center'>
									<Icons.shoppingCart className='text-muted-foreground/30 mb-3 h-12 w-12' />
									<p className='text-muted-foreground text-sm font-medium'>Carrito vacío</p>
									<p className='text-muted-foreground mt-1 text-xs'>Agrega productos para comenzar</p>
								</motion.div>
							)}
						</div>

						{orderItems.length > 0 && (
							<div className='bg-muted/30 space-y-4 border-t p-4'>
								<div className='space-y-2 text-sm'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Subtotal</span>
										<span className='font-medium'>${subtotal.toFixed(2)}</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>IVA (16%)</span>
										<span className='font-medium'>${tax.toFixed(2)}</span>
									</div>

									<Separator />

									<div className='flex justify-between font-semibold'>
										<span>Total</span>
										<span>${total.toFixed(2)}</span>
									</div>
								</div>

								<div>
									<h3 className='mb-2 text-sm font-medium'>Método de pago</h3>
									<div className='grid grid-cols-3 gap-2'>
										{paymentMethods.map(method => {
											const IconComponent = method.icon
											return (
												<ActionButton
													key={method.id}
													variant={selectedPayment === method.id ? 'default' : 'outline'}
													size='sm'
													onClick={() => onSelectPayment(method.id)}
													icon={<IconComponent className='h-4 w-4' />}
													text={method.label}
												/>
											)
										})}
									</div>
								</div>

								<motion.div whileTap={{ scale: 0.98 }}>
									<ActionButton
										variant='default'
										size='lg'
										onClick={onPlaceOrder}
										text='Procesar Venta'
										className='w-full'
									/>
								</motion.div>
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}
