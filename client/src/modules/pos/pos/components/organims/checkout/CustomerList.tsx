'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { UtilBanner } from '@/components/UtilBanner'
import { Badge } from '@/components/layout/atoms/Badge'
import { Typography } from '@/components/ui/typography'
import { I_Customer } from '@/common/types/modules/customer'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface CustomerListProps {
	customers: I_Customer[]
	onSelectCustomer: (customer: I_Customer) => void
	isLoading?: boolean
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer, isLoading = false }) => {
	if (isLoading) {
		return (
			<div className='p-6'>
				<SpinnerLoader text='Buscando...' inline />
			</div>
		)
	}

	if (customers.length === 0)
		return (
			<div className='rounded-xl p-4'>
				<UtilBanner title='Sin resultados' description={`No se encontró ningún cliente`} icon={<Icons.infoCircle />} />
			</div>
		)

	return (
		<div className='space-y-2'>
			<Typography variant='small' className='text-muted-foreground px-2'>
				{customers.length} {customers.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
			</Typography>

			<div className='max-h-60 space-y-2 overflow-y-auto rounded-lg'>
				{customers.map(customer => (
					<Card
						key={customer.id}
						role='button'
						tabIndex={0}
						aria-label={`Seleccionar cliente ${customer.firstName} ${customer.lastName}`}
						className='hover:bg-accent/50 focus:ring-primary cursor-pointer p-4 shadow-none transition-all duration-500 focus:ring-2 focus:outline-none'
						onClick={() => onSelectCustomer(customer)}
						onKeyDown={e => e.key === 'Enter' && onSelectCustomer(customer)}>
						<div className='flex items-start justify-between'>
							<div className='space-y-1.5'>
								<div className='flex items-center gap-2'>
									<Typography variant='small' className='font-semibold'>
										{customer.firstName}
										{customer.lastName}
									</Typography>
								</div>

								<div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm'>
									<span className='line-clamp-1 flex items-center gap-1 break-words'>
										<Icons.mail className='h-3.5 w-3.5' />
										{customer.email || 'No asignado'}
									</span>
								</div>
							</div>

							<Badge
								variant='info'
								className='ml-2'
								text={
									<>
										<Icons.id />
										{customer?.identificationNumber}
									</>
								}
							/>
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}
