import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Customer {
	id: string
	name: string
	email?: string
	phone?: string
}

interface CustomerState {
	selectedCustomer: Customer | null
	searchCustomer: string
	showNewCustomerForm: boolean
	newCustomer: {
		name: string
		email: string
		phone: string
	}
	mockCustomers: Customer[]
	setSelectedCustomer: (customer: Customer | null) => void
	setSearchCustomer: (search: string) => void
	setShowNewCustomerForm: (show: boolean) => void
	setNewCustomer: (customer: { name: string; email: string; phone: string }) => void
	createCustomer: () => void
	getFilteredCustomers: () => Customer[]
	clearCustomer: () => void
}

const initialCustomers: Customer[] = [
	{ id: '1', name: 'Juan Pérez', email: 'juan@email.com', phone: '+593 99 123 4567' },
	{ id: '2', name: 'María García', email: 'maria@email.com', phone: '+593 98 765 4321' },
	{ id: '3', name: 'Carlos López', email: 'carlos@email.com', phone: '+593 97 111 2222' },
	{ id: '4', name: 'Ana Rodríguez', email: 'ana@email.com', phone: '+593 96 333 4444' },
]

export const useCustomerStore = create<CustomerState>()(
	persist(
		(set, get) => ({
			selectedCustomer: null,
			searchCustomer: '',
			showNewCustomerForm: false,
			newCustomer: { name: '', email: '', phone: '' },
			mockCustomers: initialCustomers,

			setSelectedCustomer: customer => set({ selectedCustomer: customer }),
			setSearchCustomer: search => set({ searchCustomer: search }),
			setShowNewCustomerForm: show => set({ showNewCustomerForm: show }),
			setNewCustomer: customer => set({ newCustomer: customer }),

			createCustomer: () => {
				const { newCustomer, mockCustomers } = get()
				const customer: Customer = {
					id: Date.now().toString(),
					name: newCustomer.name,
					email: newCustomer.email,
					phone: newCustomer.phone,
				}
				set({
					selectedCustomer: customer,
					showNewCustomerForm: false,
					newCustomer: { name: '', email: '', phone: '' },
					mockCustomers: [...mockCustomers, customer],
				})
			},

			getFilteredCustomers: () => {
				const { mockCustomers, searchCustomer } = get()
				return mockCustomers.filter(
					customer =>
						customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
						customer.email?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
						customer.phone?.includes(searchCustomer)
				)
			},

			clearCustomer: () => {
				set({
					selectedCustomer: null,
					searchCustomer: '',
					showNewCustomerForm: false,
					newCustomer: { name: '', email: '', phone: '' },
					mockCustomers: initialCustomers,
				})
			},
		}),
		{
			name: 'customer-storage',
			partialize: state => ({
				selectedCustomer: state.selectedCustomer,
				mockCustomers: state.mockCustomers,
			}),
		}
	)
)
