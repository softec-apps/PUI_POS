'use client'

import React, { useEffect, useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
// Stores
import { useCartStore } from '@/common/stores/useCartStore'
import { useCustomerStore } from '@/common/stores/useCustomerStore'
import { useCheckoutStore } from '@/common/stores/useCheckoutStore'
// Components
import { CartItem } from '@/modules/pos/pos/components/organims/cart/CartItem'
import { PriceSummary } from '@/modules/pos/pos/components/organims/cart/PriceSummary'
import { CartEmptyState } from '@/modules/pos/pos/components/organims/cart/CartEmptyState'
import { PaymentMethods } from '@/modules/pos/pos/components/organims/checkout/PaymentMethods'
import { ProcessingScreen } from '@/modules/pos/pos/components/organims/cart/ProcessingScreen'
import { CustomerSection } from '@/modules/pos/pos/components/organims/checkout/CustomerSection'
import { Typography } from '@/components/ui/typography'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Types
interface SaleData {
	customerId: string
	customer: {
		id: string
		firstName: string
		lastName: string
		identificationType: string
		identificationNumber: string
		email?: string
		phone?: string
		address?: string
	}
	items: {
		productId: string
		productName: string
		productCode?: string
		quantity: number
		unitPrice: number
		totalPrice: number
	}[]
	financials: {
		subtotal: number
		tax: number
		taxRate: number
		total: number
		totalItems: number
	}
	payment: {
		method: 'cash' | 'digital' | 'card'
		receivedAmount: number
		change: number
		transferNumber?: string
	}
	metadata: {
		saleDate: string
	}
}

interface CartSidebarProps {
	onPlaceOrder: (saleData: SaleData) => Promise<void>
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
	const { cartState, setCartState } = useCheckoutStore()
	const { selectedCustomer, clearCustomer } = useCustomerStore()

	// Local state for payment details
	const [transferNumber, setTransferNumber] = useState<string>('')
	const [receivedAmount, setReceivedAmount] = useState<string>('')

	// Estado para el diálogo de nueva venta
	const [showNewSaleDialog, setShowNewSaleDialog] = useState<boolean>(false)

	// Referencias para el cálculo dinámico de altura
	const containerRef = useRef<HTMLDivElement>(null)
	const headerRef = useRef<HTMLDivElement>(null)
	const footerRef = useRef<HTMLDivElement>(null)
	const [scrollAreaHeight, setScrollAreaHeight] = useState<number>(0)

	// Calculations
	const subtotal = getSubtotal()
	const tax = getTax()
	const total = getTotal()
	const totalItems = getTotalItems()

	// Función para calcular la altura dinámica del ScrollArea
	const calculateScrollAreaHeight = () => {
		if (containerRef.current && headerRef.current && footerRef.current && orderItems.length > 0) {
			// Usar requestAnimationFrame para asegurar que el DOM esté actualizado
			requestAnimationFrame(() => {
				const containerHeight = containerRef.current?.offsetHeight || 0
				const headerHeight = headerRef.current?.offsetHeight || 0
				const footerHeight = footerRef.current?.offsetHeight || 0
				const padding = 32 // Espaciado adicional para evitar que se vea apretado

				const availableHeight = containerHeight - headerHeight - footerHeight - padding
				const newHeight = Math.max(availableHeight, 200) // Mínimo 200px

				// Solo actualizar si hay un cambio significativo (evitar renders innecesarios)
				setScrollAreaHeight(prev => (Math.abs(prev - newHeight) > 5 ? newHeight : prev))
			})
		}
	}

	// Effect para recalcular altura cuando cambie el contenido
	useEffect(() => {
		const timer = setTimeout(calculateScrollAreaHeight, 100) // Debounce para evitar cálculos excesivos
		return () => clearTimeout(timer)
	}, [orderItems, selectedCustomer, selectedPayment, transferNumber, receivedAmount])

	// Effect para observar cambios en todos los elementos relevantes
	useEffect(() => {
		const observers: ResizeObserver[] = []

		// Observar cambios en el contenedor principal
		if (containerRef.current) {
			const containerObserver = new ResizeObserver(() => calculateScrollAreaHeight())
			containerObserver.observe(containerRef.current)
			observers.push(containerObserver)
		}

		// Observar cambios en el footer
		if (footerRef.current) {
			const footerObserver = new ResizeObserver(() => calculateScrollAreaHeight())
			footerObserver.observe(footerRef.current)
			observers.push(footerObserver)
		}

		// Observar cambios en el header
		if (headerRef.current) {
			const headerObserver = new ResizeObserver(() => calculateScrollAreaHeight())
			headerObserver.observe(headerRef.current)
			observers.push(headerObserver)
		}

		return () => {
			observers.forEach(observer => observer.disconnect())
		}
	}, [])

	// Effect para recalcular en eventos de ventana
	useEffect(() => {
		const handleResize = () => {
			// Debounce para evitar cálculos excesivos durante el resize
			clearTimeout(window._scrollResizeTimeout)
			window._scrollResizeTimeout = setTimeout(calculateScrollAreaHeight, 150)
		}

		const handleFullscreenChange = () => calculateScrollAreaHeight()
		const handleOrientationChange = () => setTimeout(calculateScrollAreaHeight, 300)

		window.addEventListener('resize', handleResize)
		window.addEventListener('fullscreenchange', handleFullscreenChange)
		window.addEventListener('orientationchange', handleOrientationChange)

		return () => {
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('fullscreenchange', handleFullscreenChange)
			window.removeEventListener('orientationchange', handleOrientationChange)
			clearTimeout(window._scrollResizeTimeout)
		}
	}, [])

	// Reset payment fields when payment method changes
	useEffect(() => {
		setTransferNumber('')
		setReceivedAmount('')
	}, [selectedPayment])

	// Reset payment states when customer is removed
	useEffect(() => {
		if (!selectedCustomer) {
			setPayment('cash')
			setTransferNumber('')
			setReceivedAmount('')
		}
	}, [selectedCustomer, setPayment])

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

	// Función para preparar los datos de la venta
	const prepareSaleData = (): SaleData => {
		const received = parseFloat(receivedAmount || '0')
		const change = received - total
		return {
			customerId: selectedCustomer?.id || '',
			customer: {
				id: selectedCustomer?.id || '',
				firstName: selectedCustomer?.firstName || '',
				lastName: selectedCustomer?.lastName || '',
				identificationType: selectedCustomer?.identificationType || '',
				identificationNumber: selectedCustomer?.identificationNumber || '',
				email: selectedCustomer?.email,
				phone: selectedCustomer?.phone,
				address: selectedCustomer?.address,
			},
			items: orderItems.map(item => ({
				productId: item.id,
				productName: item.name,
				productCode: item.code,
				quantity: item.quantity,
				unitPrice: item.price,
				totalPrice: item.price * item.quantity,
			})),
			financials: {
				subtotal,
				tax,
				taxRate: 0.15,
				total,
				totalItems,
			},
			payment: {
				method: selectedPayment as 'cash' | 'digital' | 'card',
				receivedAmount: received,
				change: change,
				...(selectedPayment !== 'cash' &&
					transferNumber && {
						transferNumber: transferNumber.trim(),
					}),
			},
			metadata: {
				saleDate: new Date().toISOString(),
			},
		}
	}

	// Función de validación
	const validateSaleData = (saleData: SaleData): boolean => {
		if (!saleData.customerId || !saleData.customer.id) return false
		if (!saleData.items.length) return false
		if (saleData.financials.total <= 0) return false
		if (saleData.payment.method === 'cash') {
			if (saleData.payment.receivedAmount < saleData.financials.total) return false
		}
		if (saleData.payment.method !== 'cash') {
			if (!saleData.payment.transferNumber?.trim()) return false
		}
		return true
	}

	// Función mejorada para validar si se puede finalizar la orden
	const canFinalizeOrder = () => {
		// Validaciones básicas
		if (!selectedCustomer || !selectedPayment || orderItems.length === 0) return false

		const received = parseFloat(receivedAmount || '0')
		return received >= total && received > 0 && !isNaN(received)
	}

	const handleFinalizeOrder = async () => {
		setCartState('processing')
		try {
			const saleData = prepareSaleData()
			if (!validateSaleData(saleData)) throw new Error('Datos de venta inválidos')
			// Simulate payment processing
			await new Promise(resolve => setTimeout(resolve, 2000))
			await onPlaceOrder(saleData)
			// Reset state after success
			setCartState('cart')
			clearCart()
			clearCustomer()
			setTransferNumber('')
			setReceivedAmount('')
		} catch (error) {
			console.error('Error processing order:', error)
			setCartState('cart')
		}
	}

	// Función para manejar el botón "Nueva venta"
	const handleNewSaleClick = () => {
		setShowNewSaleDialog(true)
	}

	// Función para confirmar nueva venta
	const handleConfirmNewSale = () => {
		// Limpiar el carrito y todos los datos
		clearCart()
		clearCustomer()
		setTransferNumber('')
		setReceivedAmount('')
		setPayment('cash')
		setShowNewSaleDialog(false)
	}

	// Función para cancelar nueva venta
	const handleCancelNewSale = () => setShowNewSaleDialog(false)

	// Full screen processing screen
	if (cartState === 'processing') return <ProcessingScreen />

	return (
		<>
			<div ref={containerRef} className='flex h-full w-full max-w-[24rem] flex-col overflow-hidden'>
				{/* Header */}
				<div ref={headerRef} className='flex-shrink-0'>
					{orderItems.length !== 0 && (
						<Typography variant='h6' className='mb-2'>
							Productos ({totalItems})
						</Typography>
					)}
				</div>

				{/* Contenido principal con scroll dinámico */}
				<div className='w-full flex-1 overflow-hidden'>
					<AnimatePresence mode='popLayout'>
						{orderItems.length > 0 ? (
							<ScrollArea
								className='w-full pr-4'
								style={{
									height: scrollAreaHeight > 0 ? `${scrollAreaHeight}px` : '50vh',
									minHeight: '270px',
									maxHeight: '70vh',
								}}>
								<div className='space-y-2'>
									{orderItems.map((item, index) => (
										<CartItem
											key={item.id}
											item={item}
											index={index}
											onUpdateQuantity={updateQuantity}
											onRemoveItem={removeItem}
										/>
									))}
								</div>
							</ScrollArea>
						) : (
							// Empty State - Contenedor ajustado
							<div className='flex h-full min-h-[300px] items-center justify-center overflow-hidden'>
								<CartEmptyState />
							</div>
						)}
					</AnimatePresence>
				</div>

				{/* Footer con resumen y botón */}
				{orderItems.length > 0 && (
					<div ref={footerRef} className='w-full flex-shrink-0 space-y-4 pt-4 pb-6'>
						{/* Customer Section - Solo si hay items */}
						<CustomerSection />

						{/* Payment Methods - Solo si hay items y cliente */}
						{selectedCustomer && (
							<PaymentMethods
								selectedPayment={selectedPayment}
								onSelectPayment={setPayment}
								transferNumber={transferNumber}
								onTransferNumberChange={setTransferNumber}
								receivedAmount={receivedAmount}
								onReceivedAmountChange={setReceivedAmount}
								totalAmount={total}
							/>
						)}

						<PriceSummary
							subtotal={subtotal}
							tax={tax}
							total={total}
							receivedAmount={receivedAmount}
							selectedPayment={selectedPayment}
						/>

						<div className='flex w-full items-center justify-center gap-4'>
							<ActionButton
								size='pos'
								variant='destructive'
								disabled={orderItems.length === 0}
								onClick={handleNewSaleClick}
								text='Nueva venta'
								className='basis-1/2 text-lg font-semibold'
							/>

							<ActionButton
								size='pos'
								variant='pos'
								disabled={!canFinalizeOrder()}
								onClick={handleFinalizeOrder}
								text='Finalizar venta'
								className='basis-1/2 text-lg font-semibold'
							/>
						</div>
					</div>
				)}
			</div>

			{/* Diálogo de confirmación para nueva venta */}
			<Dialog open={showNewSaleDialog} onOpenChange={setShowNewSaleDialog}>
				<DialogContent className='sm:max-w-xl'>
					<DialogHeader>
						<DialogTitle>¿Iniciar nueva venta?</DialogTitle>
						<DialogDescription>
							Se perderán todos los productos seleccionados, la información del cliente seleccionado y los datos de pago
							ingresados. <strong>Esta acción no se puede deshacer.</strong>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='flex gap-2'>
						<Button variant='secondary' onClick={handleCancelNewSale}>
							Cancelar
						</Button>
						<Button variant='destructive' onClick={handleConfirmNewSale}>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
