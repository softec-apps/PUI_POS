'use client'

import React from 'react'
import { Typography } from '@/components/ui/typography'
import { CustomerSearch } from './CustomerSearch'
import { CustomerList } from './CustomerList'
import { NewCustomerForm } from './NewCustomerForm'
import { SelectedCustomer } from './SelectedCustomer'
import { useCustomerStore } from '@/common/stores/useCustomerStore'

export const CustomerSection: React.FC = () => {
	const {
		selectedCustomer,
		searchCustomer,
		showNewCustomerForm,
		newCustomer,
		setSelectedCustomer,
		setSearchCustomer,
		setShowNewCustomerForm,
		setNewCustomer,
		createCustomer,
		getFilteredCustomers,
	} = useCustomerStore()

	const filteredCustomers = getFilteredCustomers()

	return (
		<div className='space-y-4'>
			<Typography variant='h6'>Cliente</Typography>

			{!selectedCustomer ? (
				<div className='space-y-4'>
					{!showNewCustomerForm ? (
						<>
							<CustomerSearch
								searchValue={searchCustomer}
								onSearchChange={setSearchCustomer}
								onShowNewForm={() => setShowNewCustomerForm(true)}
							/>

							{searchCustomer && <CustomerList customers={filteredCustomers} onSelectCustomer={setSelectedCustomer} />}
						</>
					) : (
						<NewCustomerForm
							customer={newCustomer}
							onCustomerChange={setNewCustomer}
							onCreateCustomer={createCustomer}
							onCancel={() => setShowNewCustomerForm(false)}
						/>
					)}
				</div>
			) : (
				<SelectedCustomer customer={selectedCustomer} onDeselect={() => setSelectedCustomer(null)} />
			)}
		</div>
	)
}
