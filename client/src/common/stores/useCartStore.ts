import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { I_Photo } from '@/common/types/photo'

export interface OrderItem {
	id: string
	name: string
	price: number
	quantity: number
	category?: string
	image?: I_Photo
	code?: string
	taxRate: number // Agregado taxRate específico por producto
}

interface CartState {
	orderItems: OrderItem[]
	selectedPayment: string
	addItem: (product: {
		id: string
		name: string
		price: number
		code?: string
		image?: string
		taxRate: number // Agregado taxRate en el parámetro
	}) => void
	updateQuantity: (id: string, change: number) => void
	removeItem: (id: string) => void
	setPayment: (paymentId: string) => void
	clearCart: () => void
	getSubtotal: () => number
	getTax: () => number
	getTotal: () => number
	getTotalItems: () => number
	// Nuevas funciones para cálculos por item
	getItemSubtotal: (item: OrderItem) => number
	getItemTax: (item: OrderItem) => number
	getItemTotal: (item: OrderItem) => number
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
									image: product.image,
									price: product.price,
									quantity: 1,
									code: product.code,
									taxRate: product.taxRate, // Usar el taxRate específico del producto
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

			// Subtotal sin impuestos
			getSubtotal: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => {
					const itemSubtotal = item.price * item.quantity
					return sum + itemSubtotal
				}, 0)
			},

			// Total de impuestos calculado por cada producto
			getTax: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => {
					const itemSubtotal = item.price * item.quantity
					const itemTax = itemSubtotal * (item.taxRate / 100)
					return sum + itemTax
				}, 0)
			},

			// Total incluyendo impuestos
			getTotal: () => {
				return get().getSubtotal() + get().getTax()
			},

			getTotalItems: () => {
				const { orderItems } = get()
				return orderItems.reduce((sum, item) => sum + item.quantity, 0)
			},

			// Funciones auxiliares para cálculos por item
			getItemSubtotal: (item: OrderItem) => {
				return item.price * item.quantity
			},

			getItemTax: (item: OrderItem) => {
				const itemSubtotal = item.price * item.quantity
				return itemSubtotal * (item.taxRate / 100)
			},

			getItemTotal: (item: OrderItem) => {
				const itemSubtotal = item.price * item.quantity
				const itemTax = itemSubtotal * (item.taxRate / 100)
				return itemSubtotal + itemTax
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
