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
import { Icons } from '@/components/icons'

// Types actualizados para múltiples pagos
interface PaymentEntry {
	id: string
	method: string
	amount: number
	transferNumber?: string
	timestamp: number
}

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
		image: string
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
	payments: PaymentEntry[]
	metadata: {
		saleDate: string
	}
}

interface CartSidebarProps {
	handleSriSale: (saleData: SaleData) => Promise<void>
	handleSimpleSale: (saleData: SaleData) => Promise<void>
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ handleSriSale, handleSimpleSale }) => {
	// Store hooks
	const { orderItems, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getTotal, getTotalItems } =
		useCartStore()
	const { cartState, setCartState } = useCheckoutStore()
	const { selectedCustomer, clearCustomer } = useCustomerStore()

	// Local state para múltiples pagos
	const [payments, setPayments] = useState<PaymentEntry[]>([])

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

	// Cálculos de pagos
	const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
	const remainingAmount = total - totalPaid
	const changeAmount = remainingAmount < 0 ? Math.abs(remainingAmount) : 0
	const isFullyPaid = remainingAmount <= 0.01 // Tolerancia para centavos

	// Función para calcular la altura dinámica del ScrollArea
	const calculateScrollAreaHeight = () => {
		if (containerRef.current && headerRef.current && footerRef.current && orderItems.length > 0) {
			requestAnimationFrame(() => {
				const containerHeight = containerRef.current?.offsetHeight || 0
				const headerHeight = headerRef.current?.offsetHeight || 0
				const footerHeight = footerRef.current?.offsetHeight || 0
				const padding = 32

				const availableHeight = containerHeight - headerHeight - footerHeight - padding
				const newHeight = Math.max(availableHeight, 200)

				setScrollAreaHeight(prev => (Math.abs(prev - newHeight) > 5 ? newHeight : prev))
			})
		}
	}

	// Effect para recalcular altura cuando cambie el contenido
	useEffect(() => {
		const timer = setTimeout(calculateScrollAreaHeight, 100)
		return () => clearTimeout(timer)
	}, [orderItems, selectedCustomer, payments])

	// Effects para ResizeObserver y eventos de ventana
	useEffect(() => {
		const observers: ResizeObserver[] = []

		if (containerRef.current) {
			const containerObserver = new ResizeObserver(() => calculateScrollAreaHeight())
			containerObserver.observe(containerRef.current)
			observers.push(containerObserver)
		}

		if (footerRef.current) {
			const footerObserver = new ResizeObserver(() => calculateScrollAreaHeight())
			footerObserver.observe(footerRef.current)
			observers.push(footerObserver)
		}

		if (headerRef.current) {
			const headerObserver = new ResizeObserver(() => calculateScrollAreaHeight())
			headerObserver.observe(headerRef.current)
			observers.push(headerObserver)
		}

		return () => {
			observers.forEach(observer => observer.disconnect())
		}
	}, [])

	useEffect(() => {
		const handleResize = () => {
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

	// Reset payments when customer is removed
	useEffect(() => {
		if (!selectedCustomer) {
			setPayments([])
		}
	}, [selectedCustomer])

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
				image: item?.image,
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
			payments: payments.map(payment => ({
				...payment,
				// Asegurar que los métodos estén bien mapeados
				method: payment.method as 'cash' | 'digital' | 'card',
			})),
			metadata: {
				saleDate: new Date().toISOString(),
			},
		}
	}

	// Función de validación actualizada
	const validateSaleData = (saleData: SaleData): boolean => {
		if (!saleData.customerId || !saleData.customer.id) return false
		if (!saleData.items.length) return false
		if (saleData.financials.total <= 0) return false
		if (!saleData.payments.length) return false

		// Validar que el total pagado cubra el monto total
		const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0)
		if (totalPaid < saleData.financials.total - 0.01) return false // Tolerancia de 1 centavo

		// Validar que los pagos no efectivo tengan número de transferencia/autorización
		const nonCashPayments = saleData.payments.filter(payment => payment.method !== 'cash')
		for (const payment of nonCashPayments) {
			if (!payment.transferNumber?.trim()) return false
		}

		return true
	}

	// Función para validar si se puede finalizar la orden
	const canFinalizeOrder = () => {
		if (!selectedCustomer || orderItems.length === 0) return false
		if (payments.length === 0) return false
		if (!isFullyPaid) return false

		// Validar números de transferencia para pagos no efectivo
		const nonCashPayments = payments.filter(payment => payment.method !== 'cash')
		for (const payment of nonCashPayments) {
			if (!payment.transferNumber?.trim()) return false
		}

		return true
	}

	const handleFinalizeSriSale = async () => {
		setCartState('processing')
		try {
			const saleData = prepareSaleData()
			if (!validateSaleData(saleData)) throw new Error('Datos de venta inválidos')

			// Simulate payment processing
			await handleSriSale(saleData)

			// Reset state after success
			setCartState('cart')
			clearCart()
			clearCustomer()
			setPayments([])
		} catch (error) {
			console.error('Error processing order:', error)
			setCartState('cart')
		}
	}

	const handleFinalizeSimpleSale = async () => {
		setCartState('processing')
		try {
			const saleData = prepareSaleData()
			if (!validateSaleData(saleData)) throw new Error('Datos de venta inválidos')

			// Enviar datos al backend
			await handleSimpleSale(saleData)

			// Reset state after success
			setCartState('cart')
			clearCart()
			clearCustomer()
			setPayments([])
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
		clearCart()
		clearCustomer()
		setPayments([])
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
											onUpdateQuantity={(id, change) => {
												const currentItem = orderItems.find(orderItem => orderItem.id === id)
												if (currentItem) {
													const newQuantity = currentItem.quantity + change
													updateQuantity(id, Math.max(1, newQuantity))
												}
											}}
											onRemoveItem={removeItem}
										/>
									))}
								</div>
							</ScrollArea>
						) : (
							<div className='flex h-full min-h-[300px] items-center justify-center overflow-hidden'>
								<CartEmptyState />
							</div>
						)}
					</AnimatePresence>
				</div>

				{/* Footer con resumen y botón */}
				{orderItems.length > 0 && (
					<div ref={footerRef} className='w-full flex-shrink-0 space-y-4 pb-6'>
						{/* Customer Section */}
						<CustomerSection />

						{/* Payment Methods - Con soporte para múltiples pagos */}
						{selectedCustomer && (
							<PaymentMethods payments={payments} onPaymentsChange={setPayments} totalAmount={total} />
						)}

						{/* Price Summary actualizado */}
						<PriceSummary
							subtotal={subtotal}
							tax={tax}
							total={total}
							totalPaid={totalPaid}
							remainingAmount={remainingAmount}
							changeAmount={changeAmount}
						/>

						<div className='flex w-full items-center justify-between gap-4'>
							<ActionButton
								size='lg'
								variant='destructive'
								disabled={orderItems.length === 0}
								onClick={handleNewSaleClick}
								icon={<Icons.plus />}
							/>
							<div className='flex items-center gap-3'>
								<ActionButton
									size='lg'
									variant='info'
									disabled={!canFinalizeOrder()}
									onClick={handleFinalizeSimpleSale}
									icon={<Icons.shoppingCart className='size-6' />}
									text='Simple'
								/>

								<ActionButton
									size='lg'
									variant='success'
									disabled={!canFinalizeOrder()}
									onClick={handleFinalizeSriSale}
									icon={<Icons.shoppingCart className='size-6' />}
									text='Factura'
								/>
							</div>
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
							Se perderán todos los productos seleccionados, la información del cliente seleccionado y todos los métodos
							de pago configurados. <strong>Esta acción no se puede deshacer.</strong>
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
