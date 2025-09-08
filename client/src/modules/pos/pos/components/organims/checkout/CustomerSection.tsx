'use client'

import React, { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CustomerSearch } from './CustomerSearch'
import { CustomerList } from './CustomerList'
import { CustomerFormModal } from './CustomerFormModal'
import { SelectedCustomer } from './SelectedCustomer'
import { useCustomer } from '@/common/hooks/useCustomer'
import { useCustomerStore } from '@/common/stores/useCustomerStore'
import { I_CreateCustomer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'

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
	const [dialogOpen, setDialogOpen] = useState(false)

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
	useEffect(() => setStoreSelectedCustomer(selectedCustomer), [selectedCustomer, setStoreSelectedCustomer])

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
		setDialogOpen(false) // Cerrar el diálogo después de seleccionar
	}

	const handleDeselectCustomer = () => {
		setSelectedCustomer(null) // Estado local
		// 👆 El useEffect se encarga de sincronizar con el store automáticamente
		setSearchValue('')
		setDebouncedSearchValue('')
	}

	const handleOpenDialog = () => {
		setDialogOpen(true)
		// Resetear el formulario al abrir el diálogo
		setSearchValue('')
		setShowNewCustomerForm(false)
	}

	return (
		<div className='space-y-2'>
			{selectedCustomer && <Typography variant='h6'>Cliente</Typography>}

			{/* Mostrar solo un botón inicialmente */}
			{!selectedCustomer ? (
				<ActionButton
					onClick={handleOpenDialog}
					text='Seleccionar cliente'
					icon={<Icons.user />}
					size='lg'
					className='w-full'
				/>
			) : (
				<SelectedCustomer customer={selectedCustomer} onDeselect={handleDeselectCustomer} />
			)}

			{/* Diálogo con toda la funcionalidad */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className='sm:max-w-[600px]'>
					<DialogHeader>
						<DialogTitle>Seleccionar cliente</DialogTitle>
					</DialogHeader>

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
				</DialogContent>
			</Dialog>
		</div>
	)
}
