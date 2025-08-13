'use client'
import React, { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { CustomerSearch } from './CustomerSearch'
import { CustomerList } from './CustomerList'
import { CustomerFormModal } from './CustomerFormModal'
import { SelectedCustomer } from './SelectedCustomer'
import { useCustomer } from '@/common/hooks/useCustomer'
import { I_CreateCustomer } from '@/common/types/modules/customer'
import { UtilBanner } from '@/components/UtilBanner'
import { BiSearch, BiUserPlus } from 'react-icons/bi'
import { UserPlus } from 'lucide-react'

export const CustomerSection: React.FC = () => {
	const [newCustomer, setNewCustomer] = useState<I_CreateCustomer>({
		customerType: 'regular',
		identificationType: '05',
		identificationNumber: '',
		firstName: '',
		lastName: '',
		address: '',
		phone: '',
		email: '',
	})
	const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
	const [searchValue, setSearchValue] = useState('')
	const [selectedCustomer, setSelectedCustomer] = useState<I_CreateCustomer | null>(null)

	const { recordsData, loading, error, createRecord, refetchRecords } = useCustomer({
		search: searchValue,
	})

	const customers = recordsData?.data.items || []

	useEffect(() => {
		if (!loading && searchValue.trim() !== '') {
			if (customers.length === 0) {
				// Pre-llenar el formulario con el término de búsqueda
				setNewCustomer(prev => ({
					...prev,
					identificationNumber: searchValue.trim(),
				}))
			}
			setSelectedCustomer(null)
		} else {
			setSelectedCustomer(null)
		}
	}, [searchValue, customers, loading])

	const handleCreateCustomer = async (data: any) => {
		try {
			await createRecord(data)

			setShowNewCustomerForm(false)
			setSearchValue('')
			refetchRecords()
			// Limpiar el estado del nuevo cliente
			setNewCustomer({
				customerType: 'regular',
				identificationType: '05',
				identificationNumber: '',
				firstName: '',
				lastName: '',
				address: '',
				phone: '',
				email: '',
			})
		} catch (error) {
			console.error('Error creando cliente:', error)
		}
	}

	const handleShowNewCustomerForm = () => {
		// Si hay un término de búsqueda, pre-llenar con él
		if (searchValue.trim()) {
			setNewCustomer(prev => ({
				...prev,
				identificationNumber: searchValue.trim(),
			}))
		}
		setShowNewCustomerForm(true)
	}

	const handleCancelForm = () => {
		setShowNewCustomerForm(false)
		setSearchValue('')
		setNewCustomer({
			customerType: 'regular',
			identificationType: '05',
			identificationNumber: '',
			firstName: '',
			lastName: '',
			address: '',
			phone: '',
			email: '',
		})
	}

	return (
		<div className='space-y-4'>
			<Typography variant='h6'>Cliente</Typography>

			{!selectedCustomer ? (
				<div className='space-y-4'>
					{!showNewCustomerForm ? (
						<>
							<CustomerSearch
								searchValue={searchValue}
								onSearchChange={setSearchValue}
								onShowNewForm={handleShowNewCustomerForm}
							/>

							{searchValue ? (
								customers.length > 0 ? (
									<CustomerList customers={customers} onSelectCustomer={customer => setSelectedCustomer(customer)} />
								) : (
									<div className='space-y-4'>
										<UtilBanner
											title='No se encontraron clientes'
											description={`No se encontró ningún cliente con "${searchValue}". ¿Deseas crear uno nuevo?`}
											icon={<BiSearch size={48} />}
										/>

										<div className='flex justify-center'>
											<Button onClick={handleShowNewCustomerForm} className='flex items-center gap-2' size='lg'>
												<UserPlus className='h-5 w-5' />
												Crear nuevo cliente
											</Button>
										</div>
									</div>
								)
							) : null}
						</>
					) : (
						<CustomerFormModal
							isOpen={showNewCustomerForm}
							defaultValues={newCustomer}
							onSubmit={handleCreateCustomer}
							onClose={handleCancelForm}
						/>
					)}
				</div>
			) : (
				<SelectedCustomer customer={selectedCustomer} onDeselect={() => setSelectedCustomer(null)} />
			)}
		</div>
	)
}
