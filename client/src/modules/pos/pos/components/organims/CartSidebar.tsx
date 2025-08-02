'use client'

import React, { useEffect } from 'react'
import { Icons } from '@/components/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

// Stores
import { useCartStore } from '@/common/stores/useCartStore'
import { useCustomerStore } from '@/common/stores/useCustomerStore'
import { useCheckoutStore } from '@/common/stores/useCheckoutStore'

// Components
import { CartItem } from '@/modules/pos/pos/components/organims/cart/CartItem'
import { CartHeader } from '@/modules/pos/pos/components/organims/cart/CartHeader'
import { PriceSummary } from '@/modules/pos/pos/components/organims/cart/PriceSummary'
import { CartEmptyState } from '@/modules/pos/pos/components/organims/cart/CartEmptyState'
import { PaymentMethods } from '@/modules/pos/pos/components/organims/checkout/PaymentMethods'
import { ProcessingScreen } from '@/modules/pos/pos/components/organims/cart/ProcessingScreen'
import { CustomerSection } from '@/modules/pos/pos/components/organims/checkout/CustomerSection'
import { CheckoutSummary } from '@/modules/pos/pos/components/organims/checkout/CheckoutSummary'

interface CartSidebarProps {
	onPlaceOrder: () => void
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onPlaceOrder }) => {
	// Store hooks
	const {
		orderItems,
		selectedPayment,
		updateQuantity,
		removeItem,
		setPayment,
		clearCart,
		getSubtotal,
		getTax,
		getTotal,
		getTotalItems,
	} = useCartStore()

	const { selectedCustomer, clearCustomer } = useCustomerStore()
	const { cartState, setCartState } = useCheckoutStore()

	// Calculations
	const subtotal = getSubtotal()
	const tax = getTax()
	const total = getTotal()
	const totalItems = getTotalItems()

	// Block reload during processing
	useEffect(() => {
		if (cartState === 'processing') {
			const handleBeforeUnload = (e: BeforeUnloadEvent) => {
				e.preventDefault()
				e.returnValue = 'Hay una venta en proceso. ¿Estás seguro de que quieres salir?'
				return e.returnValue
			}

			window.addEventListener('beforeunload', handleBeforeUnload)
			return () => window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	}, [cartState])

	const handleStartSale = () => setCartState('checkout')

	const handleBackToCart = () => setCartState('cart')

	const handleFinalizeOrder = async () => {
		setCartState('processing')

		try {
			// Simulate payment processing
			await new Promise(resolve => setTimeout(resolve, 3000))

			// Call the actual order processing function
			await onPlaceOrder()

			// Reset state after success
			setCartState('cart')
			clearCart()
			clearCustomer()
		} catch (error) {
			console.error('Error processing order:', error)
			setCartState('checkout') // Return to checkout on error
		}
	}

	const sidebarVariants = {
		hidden: { x: '100%', opacity: 0 },
		visible: {
			x: 0,
			opacity: 1,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 25,
				opacity: { duration: 0.2 },
			},
		},
		exit: {
			x: '100%',
			opacity: 0,
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 30,
			},
		},
	}

	// Full screen processing screen
	if (cartState === 'processing') {
		return <ProcessingScreen />
	}

	return (
		<AnimatePresence mode='wait'>
			<motion.div
				variants={sidebarVariants}
				initial='hidden'
				animate='visible'
				exit='exit'
				className='flex h-full w-[26rem] flex-col'>
				{/* Header */}
				<CartHeader cartState={cartState} totalItems={totalItems} onBackToCart={handleBackToCart} />

				{/* Main Content */}
				<div className='flex-1 overflow-hidden'>
					<AnimatePresence mode='wait'>
						{cartState === 'cart' ? (
							// Cart View
							<motion.div
								key='cart'
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								className='h-full'>
								<div className='scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent h-full overflow-y-auto pb-4'>
									<AnimatePresence mode='popLayout'>
										{orderItems.map((item, index) => (
											<CartItem
												key={item.id}
												item={item}
												index={index}
												onUpdateQuantity={updateQuantity}
												onRemoveItem={removeItem}
											/>
										))}
									</AnimatePresence>

									{/* Empty State */}
									{orderItems.length === 0 && <CartEmptyState />}
								</div>
							</motion.div>
						) : (
							// Checkout View
							<motion.div
								key='checkout'
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								className='h-full overflow-y-auto pt-4'>
								<div className='space-y-6 pb-6'>
									{/* Customer Section */}
									<CustomerSection />

									{/* Payment Methods Section */}
									<PaymentMethods selectedPayment={selectedPayment} onSelectPayment={setPayment} />
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Footer */}
				<div className='border-t border-dashed'>
					<div className='space-y-6 py-6'>
						{cartState === 'cart' ? (
							<>
								{/* Price Summary */}
								<PriceSummary subtotal={subtotal} tax={tax} total={total} variant='simple' />

								{/* Start Sale Button */}
								<ActionButton
									size='pos'
									className='w-full'
									text='Comenzar venta'
									onClick={handleStartSale}
									disabled={orderItems.length === 0}
								/>
							</>
						) : (
							<>
								{/* Checkout Summary at bottom */}
								<CheckoutSummary subtotal={subtotal} tax={tax} total={total} totalItems={totalItems} />

								{/* Finalize Order Button */}
								<ActionButton
									size='pos'
									disabled={!selectedCustomer || !selectedPayment}
									icon={<Icons.cashRegister />}
									onClick={handleFinalizeOrder}
									text='Finalizar compra'
									className='w-full'
								/>
							</>
						)}
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	)
}
