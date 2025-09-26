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
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
		discount: number
		discountAmount: number
	}[]
	financials: {
		subtotal: number
		tax: number
		total: number
		totalItems: number
		totalDiscountAmount: number
	}
	payments: PaymentEntry[]
	metadata: {
		saleDate: string
	}
}

interface CartSidebarProps {
	handleSriSale: (saleData: SaleData) => Promise<void>
	handleSimpleSale: (saleData: SaleData) => Promise<void>
	className?: string
}

// Hook para detectar si es móvil
const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < 768)
		}

		checkIsMobile()
		window.addEventListener('resize', checkIsMobile)

		return () => window.removeEventListener('resize', checkIsMobile)
	}, [])

	return isMobile
}

// Componente del contenido del carrito (reutilizable)
const CartContent: React.FC<{
	orderItems: any[]
	updateQuantity: (id: string, quantity: number) => void
	updateDiscount: (id: string, discount: number) => void
	removeItem: (id: string) => void
	totalItems: number
	payments: PaymentEntry[]
	setPayments: (payments: PaymentEntry[]) => void
	total: number
	subtotal: number
	tax: number
	totalPaid: number
	remainingAmount: number
	changeAmount: number
	totalDiscountAmount: number
	selectedCustomer: any
	canFinalizeOrder: () => boolean
	handleFinalizeSimpleSale: () => void
	handleFinalizeSriSale: () => void
	handleNewSaleClick: () => void
	scrollAreaHeight?: number
	containerRef?: React.RefObject<HTMLDivElement>
	headerRef?: React.RefObject<HTMLDivElement>
	footerRef?: React.RefObject<HTMLDivElement>
	isMobile?: boolean
}> = ({
	orderItems,
	updateQuantity,
	updateDiscount,
	removeItem,
	totalItems,
	payments,
	setPayments,
	total,
	subtotal,
	tax,
	totalPaid,
	remainingAmount,
	changeAmount,
	totalDiscountAmount,
	selectedCustomer,
	canFinalizeOrder,
	handleFinalizeSimpleSale,
	handleFinalizeSriSale,
	handleNewSaleClick,
	scrollAreaHeight,
	containerRef,
	headerRef,
	footerRef,
	isMobile = false,
}) => {
	return (
		<div ref={containerRef} className={cn('flex h-full w-full flex-col', isMobile ? 'pb-4' : 'max-w-[25rem] pb-5')}>
			{/* Header */}
			<div ref={headerRef} className='flex-shrink-0'>
				{orderItems.length !== 0 && <Typography variant='p'>Productos ({totalItems})</Typography>}
			</div>

			{/* Contenido principal con scroll dinámico */}
			<div className='w-full flex-1 overflow-hidden'>
				<AnimatePresence mode='popLayout'>
					{orderItems.length > 0 ? (
						<ScrollArea
							className={cn('w-full', isMobile ? 'pr-2' : 'pr-3')}
							style={{
								height: scrollAreaHeight > 0 ? `${scrollAreaHeight}px` : isMobile ? '40vh' : '50vh',
								minHeight: isMobile ? '200px' : '255px',
								maxHeight: isMobile ? '50vh' : '70vh',
							}}>
							<div className='divide-y'>
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
										onUpdateDiscount={(id, discount) => {
											updateDiscount(id, discount)
										}}
										onRemoveItem={removeItem}
									/>
								))}
							</div>
						</ScrollArea>
					) : (
						<div
							className={cn(
								'flex h-full items-center justify-center overflow-hidden',
								isMobile ? 'min-h-[200px]' : 'min-h-[300px]'
							)}>
							<CartEmptyState />
						</div>
					)}
				</AnimatePresence>
			</div>

			{/* Footer con resumen y botón */}
			{orderItems.length > 0 && (
				<div ref={footerRef} className='w-full flex-shrink-0 space-y-3 pt-4 pb-5 sm:pb-0'>
					{/* Customer Section */}
					<CustomerSection />

					{/* Payment Methods - Con soporte para múltiples pagos */}
					{selectedCustomer && (
						<PaymentMethods payments={payments} onPaymentsChange={setPayments} totalAmount={total} />
					)}

					<div className='space-y-3'>
						{/* Price Summary actualizado con descuentos */}
						<PriceSummary
							subtotal={subtotal}
							tax={tax}
							total={total}
							totalPaid={totalPaid}
							remainingAmount={remainingAmount}
							changeAmount={changeAmount}
							totalDiscountAmount={totalDiscountAmount}
						/>

						<div className={cn('flex w-full items-center justify-between', isMobile ? 'gap-2' : 'gap-4')}>
							<ActionButton
								size={isMobile ? 'default' : 'lg'}
								variant='destructive'
								disabled={orderItems.length === 0}
								onClick={handleNewSaleClick}
								icon={<Icons.plus />}
							/>
							<div className={cn('flex items-center', isMobile ? 'gap-2' : 'gap-3')}>
								<ActionButton
									size={isMobile ? 'default' : 'lg'}
									variant='info'
									disabled={!canFinalizeOrder()}
									onClick={handleFinalizeSimpleSale}
									icon={<Icons.shoppingBag className={isMobile ? 'size-4' : 'size-6'} />}
									text='Simple'
								/>

								<ActionButton
									size={isMobile ? 'default' : 'lg'}
									variant='success'
									disabled={!canFinalizeOrder()}
									onClick={handleFinalizeSriSale}
									icon={<Icons.shoppingBag className={isMobile ? 'size-4' : 'size-6'} />}
									text='Factura'
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ handleSriSale, handleSimpleSale, className }) => {
	const isMobile = useIsMobile()

	// Store hooks - Updated to include discount methods
	const {
		orderItems,
		updateQuantity,
		updateDiscount,
		removeItem,
		clearCart,
		getSubtotal,
		getTax,
		getTotal,
		getTotalItems,
		getTotalDiscountAmount,
	} = useCartStore()

	const { cartState, setCartState } = useCheckoutStore()
	const { selectedCustomer, clearCustomer } = useCustomerStore()

	// Local state para múltiples pagos
	const [payments, setPayments] = useState<PaymentEntry[]>([])

	// Estado para el diálogo de nueva venta
	const [showNewSaleDialog, setShowNewSaleDialog] = useState<boolean>(false)

	// Estado para el Sheet en móvil
	const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

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
	const totalDiscountAmount = getTotalDiscountAmount()

	// Cálculos de pagos
	const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
	const remainingAmount = total - totalPaid
	const changeAmount = remainingAmount < 0 ? Math.abs(remainingAmount) : 0
	const isFullyPaid = remainingAmount <= 0.01

	// Función para calcular la altura dinámica del ScrollArea
	const calculateScrollAreaHeight = () => {
		if (containerRef.current && headerRef.current && footerRef.current && orderItems.length > 0 && !isMobile) {
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

	// Effect para recalcular altura cuando cambie el contenido (solo desktop)
	useEffect(() => {
		if (!isMobile) {
			const timer = setTimeout(calculateScrollAreaHeight, 100)
			return () => clearTimeout(timer)
		}
	}, [orderItems, selectedCustomer, payments, isMobile])

	// Effects para ResizeObserver y eventos de ventana (solo desktop)
	useEffect(() => {
		if (isMobile) return

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
	}, [isMobile])

	useEffect(() => {
		if (isMobile) return

		const handleResize = () => {
			clearTimeout((window as any)._scrollResizeTimeout)
			;(window as any)._scrollResizeTimeout = setTimeout(calculateScrollAreaHeight, 150)
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
			clearTimeout((window as any)._scrollResizeTimeout)
		}
	}, [isMobile])

	// Reset payments when customer is removed
	useEffect(() => {
		if (!selectedCustomer) setPayments([])
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

	// Función para preparar los datos de la venta con descuentos
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
			items: orderItems.map(item => {
				const originalPrice = item.price * item.quantity
				const discountedTotalPrice = item.price * item.quantity * (1 - (item.discount || 0) / 100)
				const discountAmount = originalPrice - discountedTotalPrice

				return {
					productId: item.id,
					productName: item.name,
					image: item?.image,
					productCode: item.code,
					quantity: item.quantity,
					unitPrice: item.price,
					totalPrice: discountedTotalPrice,
					discount: item.discount || 0,
					discountAmount: discountAmount,
				}
			}),
			financials: {
				subtotal,
				tax,
				total,
				totalItems,
				totalDiscountAmount,
			},
			payments: payments.map(payment => ({
				...payment,
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

		const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0)
		if (totalPaid < saleData.financials.total - 0.0) return false

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

		const nonCashPayments = payments.filter(payment => payment.method !== 'cash')
		for (const payment of nonCashPayments) {
			if (!payment.transferNumber?.trim()) return false
		}

		return true
	}

	const handleFinalizeSriSale = async () => {
		setCartState('processing')
		if (isMobile) setIsSheetOpen(false)

		try {
			const saleData = prepareSaleData()
			if (!validateSaleData(saleData)) throw new Error('Datos de venta inválidos')

			console.log('🛒 Datos de venta con descuentos:', saleData)

			await handleSriSale(saleData)

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
		if (isMobile) setIsSheetOpen(false)

		try {
			const saleData = prepareSaleData()
			if (!validateSaleData(saleData)) throw new Error('Datos de venta inválidos')

			console.log('🛒 Datos de venta simple con descuentos:', saleData)

			await handleSimpleSale(saleData)

			setCartState('cart')
			clearCart()
			clearCustomer()
			setPayments([])
		} catch (error) {
			console.error('Error processing order:', error)
			setCartState('cart')
		}
	}

	const handleNewSaleClick = () => {
		setShowNewSaleDialog(true)
		if (isMobile) setIsSheetOpen(false)
	}

	const handleConfirmNewSale = () => {
		clearCart()
		clearCustomer()
		setPayments([])
		setShowNewSaleDialog(false)
	}

	const handleCancelNewSale = () => setShowNewSaleDialog(false)

	// Full screen processing screen
	if (cartState === 'processing') return <ProcessingScreen />

	// Componente común para el contenido
	const cartContentProps = {
		orderItems,
		updateQuantity,
		updateDiscount,
		removeItem,
		totalItems,
		payments,
		setPayments,
		total,
		subtotal,
		tax,
		totalPaid,
		remainingAmount,
		changeAmount,
		totalDiscountAmount,
		selectedCustomer,
		canFinalizeOrder,
		handleFinalizeSimpleSale,
		handleFinalizeSriSale,
		handleNewSaleClick,
		scrollAreaHeight,
		containerRef,
		headerRef,
		footerRef,
	}

	// Renderizado para móvil con Sheet
	if (isMobile) {
		return (
			<>
				{/* Botón flotante */}
				<div className='fixed right-4 bottom-4 z-50'>
					<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
						<SheetTrigger asChild>
							<Button
								size='icon'
								className='relative h-14 w-14 rounded-full shadow-xl'
								disabled={cartState === 'processing'}>
								<Icons.shoppingBag className='size-6' />
								<Badge
									variant='destructive'
									className='absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs'>
									{totalItems}
								</Badge>
							</Button>
						</SheetTrigger>

						<SheetContent side='bottom' className='h-screen px-4'>
							<SheetHeader className='p-0 py-4'>
								<SheetTitle>Gestionar Venta</SheetTitle>
							</SheetHeader>

							<CartContent {...cartContentProps} isMobile={true} />
						</SheetContent>
					</Sheet>
				</div>

				{/* Diálogo de confirmación para nueva venta */}
				<Dialog open={showNewSaleDialog} onOpenChange={setShowNewSaleDialog}>
					<DialogContent className='bg-popover rounded-2xl sm:max-w-xl'>
						<DialogHeader>
							<DialogTitle>¿Iniciar nueva venta?</DialogTitle>
							<DialogDescription>
								Se perderán todos los productos seleccionados, la información del cliente seleccionado y todos los
								métodos de pago configurados. <strong>Esta acción no se puede deshacer.</strong>
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

	// Renderizado para desktop (original)
	return (
		<>
			<div className={cn('flex h-full w-full max-w-[25rem] flex-col pb-6', className)}>
				<CartContent {...cartContentProps} />
			</div>

			{/* Diálogo de confirmación para nueva venta */}
			<Dialog open={showNewSaleDialog} onOpenChange={setShowNewSaleDialog}>
				<DialogContent className='bg-popover rounded-2xl sm:max-w-xl'>
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
