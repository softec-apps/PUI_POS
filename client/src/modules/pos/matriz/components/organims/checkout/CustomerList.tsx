'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Customer } from '@/common/stores/useCustomerStore'

interface CustomerListProps {
	customers: Customer[]
	onSelectCustomer: (customer: Customer) => void
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer }) => (
	<div className='max-h-40 space-y-2 overflow-y-auto'>
		{customers.map(customer => (
			<Card
				key={customer.id}
				className='hover:bg-accent cursor-pointer border-none p-3 shadow-none transition-colors'
				onClick={() => onSelectCustomer(customer)}>
				<div className='space-y-1'>
					<Typography variant='small' className='font-medium'>
						{customer.name}
					</Typography>
					<Typography variant='small' className='text-muted-foreground'>
						{customer.email} • {customer.phone}
					</Typography>
				</div>
			</Card>
		))}
	</div>
)
