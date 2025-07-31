'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Customer } from '@/modules/pos/martiz/hooks/useCustomerStore'

interface SelectedCustomerProps {
	customer: Customer
	onDeselect: () => void
}

export const SelectedCustomer: React.FC<SelectedCustomerProps> = ({ customer, onDeselect }) => (
	<Card className='bg-primary/5 border-primary/20 p-4'>
		<div className='flex items-start justify-between'>
			<div className='space-y-1'>
				<Typography variant='small' className='font-medium'>
					{customer.name}
				</Typography>
				<Typography variant='small' className='text-muted-foreground'>
					{customer.email && `${customer.email} • `}
					{customer.phone}
				</Typography>
			</div>
			<Button variant='ghost' size='sm' onClick={onDeselect}>
				<X className='h-4 w-4' />
			</Button>
		</div>
	</Card>
)
