'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Customer } from '@/common/stores/useCustomerStore'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'

interface SelectedCustomerProps {
	customer: Customer
	onDeselect: () => void
}

export const SelectedCustomer: React.FC<SelectedCustomerProps> = ({ customer, onDeselect }) => (
	<Card className='bg-accent border-primary/20 border-none p-4 shadow-none'>
		<div className='flex items-center justify-between'>
			<div className='space-y-1'>
				<Typography variant='small' className='text-primary'>
					{customer.name}
				</Typography>

				<Typography variant='small'>
					{customer.email && `${customer.email} • `}
					{customer.phone}
				</Typography>
			</div>

			<ActionButton
				variant='secondary'
				size='pos'
				tooltip='Remover'
				className='bg-destructive/20 text-destructive hover:bg-destructive/30'
				onClick={onDeselect}
				icon={<Icons.x className='h-4 w-4' />}
			/>
		</div>
	</Card>
)
