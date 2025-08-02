import { create } from 'zustand'

export type CartState = 'cart' | 'checkout' | 'processing'

interface CheckoutState {
	cartState: CartState
	setCartState: (state: CartState) => void
	resetCheckout: () => void
}

export const useCheckoutStore = create<CheckoutState>(set => ({
	cartState: 'cart',
	setCartState: state => set({ cartState: state }),
	resetCheckout: () => set({ cartState: 'cart' }),
}))
