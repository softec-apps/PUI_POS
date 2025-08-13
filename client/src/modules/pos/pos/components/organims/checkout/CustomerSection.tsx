'use client'

import React, { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { CustomerSearch } from './CustomerSearch'
import { CustomerList } from './CustomerList'
import { CustomerFormModal } from './CustomerFormModal'
import { SelectedCustomer } from './SelectedCustomer'
import { useCustomer } from '@/common/hooks/useCustomer'
import { useCustomerStore } from '@/common/stores/useCustomerStore'
import { I_CreateCustomer } from '@/common/types/modules/customer'

export const CustomerSection: React.FC = () => {
	// Estado local (se mantiene igual)
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
	const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
	const [selectedCustomer, setSelectedCustomer] = useState<I_CreateCustomer | null>(null)
	const [shouldAutoSelect, setShouldAutoSelect] = useState(false)

	// Hook de datos (se mantiene igual)
	const { recordsData, loading, error, createRecord, refetchRecords } = useCustomer({
		search: debouncedSearchValue,
	})

	// Store - para sincronizar la selección
	const { selectedCustomer: storeSelectedCustomer, setSelectedCustomer: setStoreSelectedCustomer } = useCustomerStore()

	const customers = recordsData?.data.items || []

	// 🚀 INICIALIZAR el estado local con el valor del store al montar el componente
	useEffect(() => {
		// Solo inicializar si hay un customer en el store y el estado local está vacío
		if (storeSelectedCustomer && !selectedCustomer) {
			setSelectedCustomer(storeSelectedCustomer)
		}
	}, []) // Solo al montar el componente

	// Debounce para la búsqueda (se mantiene igual)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchValue(searchValue)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchValue])

	// Lógica de auto-selección (modificada para no limpiar la selección persistente)
	useEffect(() => {
		if (!loading && debouncedSearchValue.trim() !== '') {
			if (customers.length === 0) {
				setNewCustomer(prev => ({
					...prev,
					identificationNumber: debouncedSearchValue.trim(),
				}))
				// Solo limpiar si no hay un customer persistido y no está en modo auto-select
				if (!shouldAutoSelect && !storeSelectedCustomer) {
					setSelectedCustomer(null)
				}
			} else if (customers.length > 0) {
				if (shouldAutoSelect) {
					setSelectedCustomer(customers[0])
					setShouldAutoSelect(false)
				}
			}
		}
		// NO limpiar la selección si está vacío - podría ser un customer persistido
	}, [debouncedSearchValue, customers, loading, shouldAutoSelect, storeSelectedCustomer])

	// 🚀 SINCRONIZAR con el store cada vez que cambie la selección local
	useEffect(() => {
		setStoreSelectedCustomer(selectedCustomer)
	}, [selectedCustomer, setStoreSelectedCustomer])

	const handleCreateCustomer = async (data: any) => {
		try {
			await createRecord(data)
			setShowNewCustomerForm(false)
			setShouldAutoSelect(true)
			setSearchValue(data.identificationNumber)
			await refetchRecords()
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
			throw error
		}
	}

	const handleShowNewCustomerForm = () => {
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

	const handleSelectCustomer = (customer: I_CreateCustomer) => {
		setSelectedCustomer(customer) // Estado local
		// 👆 El useEffect se encarga de sincronizar con el store automáticamente
		setSearchValue('')
		setDebouncedSearchValue('')
	}

	const handleDeselectCustomer = () => {
		setSelectedCustomer(null) // Estado local
		// 👆 El useEffect se encarga de sincronizar con el store automáticamente
		setSearchValue('')
		setDebouncedSearchValue('')
	}

	return (
		<div className='space-y-4'>
			<Typography variant='lead'>Cliente</Typography>

			{!selectedCustomer ? (
				<div className='space-y-4'>
					{!showNewCustomerForm ? (
						<>
							<CustomerSearch
								searchValue={searchValue}
								onSearchChange={setSearchValue}
								onShowNewForm={handleShowNewCustomerForm}
							/>

							{debouncedSearchValue && customers && (
								<CustomerList customers={customers} onSelectCustomer={handleSelectCustomer} isLoading={loading} />
							)}
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
				<SelectedCustomer customer={selectedCustomer} onDeselect={handleDeselectCustomer} />
			)}
		</div>
	)
}
