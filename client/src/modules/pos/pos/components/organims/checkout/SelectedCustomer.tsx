'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'

interface SelectedCustomerProps {
	customer: I_Customer
	onDeselect: () => void
}

export const SelectedCustomer: React.FC<SelectedCustomerProps> = ({ customer, onDeselect }) => (
	<Card className='bg-popover border-border/50 rounded-2xl p-1 shadow-none transition-colors duration-500'>
		<CardContent className='flex items-center justify-between p-1'>
			<div>
				<div className='flex items-center gap-2'>
					<Typography variant='small'>
						{customer.firstName} {customer.lastName}
					</Typography>
				</div>
			</div>

			<ActionButton
				variant='secondary'
				size='icon'
				tooltip='Remover'
				className='bg-destructive/20 text-destructive hover:bg-destructive/30'
				onClick={onDeselect}
				icon={<Icons.trash />}
			/>
		</CardContent>
	</Card>
)
