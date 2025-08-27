import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { I_Customer, I_CreateCustomer } from '@/common/types/modules/customer'
import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'

interface CustomerState {
	selectedCustomer: I_Customer | null
	searchCustomer: string
	debouncedSearchCustomer: string
	showNewCustomerForm: boolean
	shouldAutoSelect: boolean
	newCustomer: I_CreateCustomer
	setSelectedCustomer: (customer: I_Customer | null) => void
	setSearchCustomer: (search: string) => void
	setDebouncedSearchCustomer: (search: string) => void
	setShowNewCustomerForm: (show: boolean) => void
	setShouldAutoSelect: (should: boolean) => void
	setNewCustomer: (customer: I_CreateCustomer) => void
	updateNewCustomer: (updates: Partial<I_CreateCustomer>) => void
	clearCustomer: () => void
	resetNewCustomer: () => void
}

const initialNewCustomer: I_CreateCustomer = {
	customerType: CustomerType.REGULAR,
	identificationType: IdentificationType.IDENTIFICATION_CARD,
	identificationNumber: '',
	firstName: '',
	lastName: '',
	address: '',
	phone: '',
	email: '',
}

// Los datos reales vienen del hook useCustomer, no necesitamos datos mock

export const useCustomerStore = create<CustomerState>()(
	persist(
		set => ({
			selectedCustomer: null,
			searchCustomer: '',
			debouncedSearchCustomer: '',
			showNewCustomerForm: false,
			shouldAutoSelect: false,
			newCustomer: { ...initialNewCustomer },

			setSelectedCustomer: customer => set({ selectedCustomer: customer }),

			setSearchCustomer: search => set({ searchCustomer: search }),

			setDebouncedSearchCustomer: search => set({ debouncedSearchCustomer: search }),

			setShowNewCustomerForm: show => set({ showNewCustomerForm: show }),

			setShouldAutoSelect: should => set({ shouldAutoSelect: should }),

			setNewCustomer: customer => set({ newCustomer: customer }),

			updateNewCustomer: updates =>
				set(state => ({
					newCustomer: { ...state.newCustomer, ...updates },
				})),

			resetNewCustomer: () => set({ newCustomer: { ...initialNewCustomer } }),

			clearCustomer: () =>
				set({
					selectedCustomer: null,
					searchCustomer: '',
					debouncedSearchCustomer: '',
					showNewCustomerForm: false,
					shouldAutoSelect: false,
					newCustomer: { ...initialNewCustomer },
				}),
		}),
		{
			name: 'customer-storage',
			partialize: state => ({
				selectedCustomer: state.selectedCustomer,
			}),
		}
	)
)
