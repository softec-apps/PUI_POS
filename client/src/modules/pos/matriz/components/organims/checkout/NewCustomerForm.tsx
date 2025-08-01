'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface NewCustomerFormProps {
	customer: {
		name: string
		email: string
		phone: string
	}
	onCustomerChange: (customer: { name: string; email: string; phone: string }) => void
	onCreateCustomer: () => void
	onCancel: () => void
}

export const NewCustomerForm: React.FC<NewCustomerFormProps> = ({
	customer,
	onCustomerChange,
	onCreateCustomer,
	onCancel,
}) => (
	<div className='space-y-4'>
		<div className='space-y-2'>
			<Label htmlFor='name'>Nombre completo</Label>
			<Input
				id='name'
				value={customer.name}
				onChange={e => onCustomerChange({ ...customer, name: e.target.value })}
				placeholder='Ingresa el nombre'
			/>
		</div>
		<div className='space-y-2'>
			<Label htmlFor='email'>Email (opcional)</Label>
			<Input
				id='email'
				type='email'
				value={customer.email}
				onChange={e => onCustomerChange({ ...customer, email: e.target.value })}
				placeholder='email@ejemplo.com'
			/>
		</div>
		<div className='space-y-2'>
			<Label htmlFor='phone'>Teléfono (opcional)</Label>
			<Input
				id='phone'
				value={customer.phone}
				onChange={e => onCustomerChange({ ...customer, phone: e.target.value })}
				placeholder='+593 99 123 4567'
			/>
		</div>
		<div className='flex gap-2'>
			<Button onClick={onCreateCustomer} disabled={!customer.name.trim()} className='flex-1'>
				<Check className='mr-2 h-4 w-4' />
				Crear
			</Button>
			<Button variant='outline' onClick={onCancel}>
				Cancelar
			</Button>
		</div>
	</div>
)
