import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OrderItem {
	id: string
	name: string
	price: number
	quantity: number
	category?: string
	image?: string
	code?: string
}

interface CartState {
	orderItems: OrderItem[]
	selectedPayment: string
	addItem: (product: { id: string; name: string; price: number; code?: string }) => void
	updateQuantity: (id: string, change: number) => void
	removeItem: (id: string) => void
	setPayment: (paymentId: string) => void
	clearCart: () => void
	getSubtotal: () => number
	getTax: () => number
	getTotal: () => number
	getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			orderItems: [],
			selectedPayment: 'cash',

			addItem: product =>
				set(state => {
					const existingItem = state.orderItems.find(item => item.id === product.id)
					if (existingItem) {
						return {
							orderItems: state.orderItems.map(item =>
								item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
							),
						}
					} else {
						return {
							orderItems: [
								...state.orderItems,
								{
									id: product.id,
									name: product.name,
									price: product.price,
									quantity: 1,
									code: product.code,
								},
							],
						}
					}
				}),

			updateQuantity: (id, change) =>
				set(state => ({
					orderItems: state.orderItems
						.map(item => {
							if (item.id === id) {
								const newQuantity = item.quantity + change
								return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
							}
							return item
						})
						.filter(item => item.quantity > 0),
				})),

			removeItem: id =>
				set(state => ({
					orderItems: state.orderItems.filter(item => item.id !== id),
				})),

			setPayment: paymentId => set({ selectedPayment: paymentId }),

			clearCart: () => set({ orderItems: [], selectedPayment: 'cash' }),

			getSubtotal: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
			},

			getTax: () => {
				return get().getSubtotal() * 0.16
			},

			getTotal: () => {
				return get().getSubtotal() + get().getTax()
			},

			getTotalItems: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => sum + item.quantity, 0)
			},
		}),
		{
			name: 'cart-storage',
			partialize: state => ({
				orderItems: state.orderItems,
				selectedPayment: state.selectedPayment,
			}),
		}
	)
)
