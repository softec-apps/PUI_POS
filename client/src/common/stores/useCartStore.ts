import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
	id: string
	name: string
	price: number
	quantity: number
	image?: string
	code?: string
	taxRate: number
	discount?: number // Percentage discount (0-100)
}

interface PaymentEntry {
	id: string
	method: string
	amount: number
	transferNumber?: string
	timestamp: number
}

interface CartStore {
	// Existing cart state
	orderItems: CartItem[]
	selectedPayment: string

	// New payments state
	payments: PaymentEntry[]

	// Existing cart actions
	addItem: (item: Omit<CartItem, 'quantity'>) => void
	removeItem: (id: string) => void
	updateQuantity: (id: string, quantity: number) => void
	updateDiscount: (id: string, discount: number) => void
	clearCart: () => void

	// Existing payment actions (kept for backward compatibility)
	setPayment: (payment: string) => void

	// New payment actions
	addPayment: (payment: Omit<PaymentEntry, 'id' | 'timestamp'>) => void
	removePayment: (paymentId: string) => void
	updatePayment: (paymentId: string, updates: Partial<PaymentEntry>) => void
	clearPayments: () => void

	// Calculation methods
	getSubtotal: () => number
	getTax: () => number
	getTotal: () => number
	getTotalItems: () => number
	getTotalPaid: () => number
	getRemainingAmount: () => number
	getChangeAmount: () => number
	getIsFullyPaid: () => boolean
	getTotalDiscountAmount: () => number
	getItemDiscountedPrice: (item: CartItem) => number
	getItemTotalPrice: (item: CartItem) => number
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			// Initial state
			orderItems: [],
			selectedPayment: 'cash',
			payments: [],

			// Cart actions
			addItem: newItem => {
				set(state => {
					const existingItem = state.orderItems.find(item => item.id === newItem.id)

					if (existingItem) {
						return {
							orderItems: state.orderItems.map(item =>
								item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
							),
						}
					}

					return {
						orderItems: [...state.orderItems, { ...newItem, quantity: 1, discount: 0 }],
					}
				})
			},

			removeItem: id => {
				set(state => ({
					orderItems: state.orderItems.filter(item => item.id !== id),
				}))
			},

			updateQuantity: (id, quantity) => {
				if (quantity <= 0) {
					get().removeItem(id)
					return
				}

				set(state => ({
					orderItems: state.orderItems.map(item => (item.id === id ? { ...item, quantity } : item)),
				}))
			},

			updateDiscount: (id, discount) => {
				// Clamp discount between 0 and 100
				const clampedDiscount = Math.max(0, Math.min(100, discount))

				set(state => ({
					orderItems: state.orderItems.map(item => (item.id === id ? { ...item, discount: clampedDiscount } : item)),
				}))
			},

			clearCart: () => {
				set(() => ({
					orderItems: [],
					payments: [],
					selectedPayment: 'cash',
				}))
			},

			// Payment actions (backward compatibility)
			setPayment: payment => {
				set(() => ({ selectedPayment: payment }))
			},

			// New payment actions
			addPayment: payment => {
				set(state => ({
					payments: [
						...state.payments,
						{
							...payment,
							id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
							timestamp: Date.now(),
						},
					],
				}))
			},

			removePayment: paymentId => {
				set(state => ({
					payments: state.payments.filter(payment => payment.id !== paymentId),
				}))
			},

			updatePayment: (paymentId, updates) => {
				set(state => ({
					payments: state.payments.map(payment => (payment.id === paymentId ? { ...payment, ...updates } : payment)),
				}))
			},

			clearPayments: () => {
				set(() => ({ payments: [] }))
			},

			// Helper methods for discount calculations
			getItemDiscountedPrice: (item: CartItem) => {
				const discount = item.discount || 0
				return item.price * (1 - discount / 100)
			},

			getItemTotalPrice: (item: CartItem) => {
				const discountedPrice = get().getItemDiscountedPrice(item)
				return discountedPrice * item.quantity
			},

			// Calculation methods
			getSubtotal: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => {
					const discountedPrice = get().getItemDiscountedPrice(item)
					return sum + discountedPrice * item.quantity
				}, 0)
			},

			getTax: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => {
					const discountedPrice = get().getItemDiscountedPrice(item)
					const itemSubtotal = discountedPrice * item.quantity
					const taxAmount = (itemSubtotal * item.taxRate) / 100
					return sum + taxAmount
				}, 0)
			},

			getTotal: () => {
				const subtotal = get().getSubtotal()
				const tax = get().getTax()
				return subtotal + tax
			},

			getTotalItems: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => sum + item.quantity, 0)
			},

			getTotalDiscountAmount: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => {
					const originalPrice = item.price * item.quantity
					const discountedPrice = get().getItemTotalPrice(item)
					return sum + (originalPrice - discountedPrice)
				}, 0)
			},

			// New payment calculation methods
			getTotalPaid: () => {
				const { payments } = get()
				return payments.reduce((sum, payment) => sum + payment.amount, 0)
			},

			getRemainingAmount: () => {
				const total = get().getTotal()
				const totalPaid = get().getTotalPaid()
				return Math.max(0, total - totalPaid)
			},

			getChangeAmount: () => {
				const total = get().getTotal()
				const totalPaid = get().getTotalPaid()
				return Math.max(0, totalPaid - total)
			},

			getIsFullyPaid: () => {
				const remainingAmount = get().getRemainingAmount()
				return remainingAmount <= 0.0 // Tolerancia de 0 centavo
			},
		}),

		{
			name: 'cart-storage',
			// Solo persistir los datos esenciales
			partialize: state => ({
				orderItems: state.orderItems,
				selectedPayment: state.selectedPayment,
				payments: state.payments,
			}),
		}
	)
)
