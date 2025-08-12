'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { useCustomer } from '@/common/hooks/useCustomer'
import { useModalState } from '@/modules/customer/hooks/useModalState'
import { usePagination } from '@/modules/customer/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useCustomerHandlers } from '@/modules/customer/hooks/useCustomerHandlers'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { CustomerHeader } from '@/modules/customer/components/templates/Header'
import { CustomerModals } from '@/modules/customer/components/templates/Modals'
import { CustomerFilters } from '@/modules/customer/components/templates/Filters'
import { TableCustomer } from '@/modules/customer/components/organisms/Table/TableCustomer'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function CustomerView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')

	const [localSearchTerm, setLocalSearchTerm] = useState<string>('')
	const debouncedSearchTerm = useDebounce(localSearchTerm, 500)

	const {
		pagination,
		currentSort,
		currentStatus,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleSort,
		handleStatusChange,
		handleResetAll,
		handlePageChange,
		setPagination,
	} = usePagination()

	useEffect(() => {
		setPagination(prev => ({
			...prev,
			search: debouncedSearchTerm,
			page: 1,
		}))
	}, [debouncedSearchTerm, setPagination])

	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setLocalSearchTerm(value)
	}, [])

	const handleResetAllWithSearch = useCallback(() => {
		setLocalSearchTerm('')
		handleResetAll()
	}, [handleResetAll])

	// Memoizar parámetros de paginación usando debouncedSearchTerm
	const paginationParams = useMemo(
		() => ({
			search: debouncedSearchTerm,
			page: pagination.page,
			limit: pagination.limit,
			sort: currentSort ? [currentSort] : undefined,
			filters: currentStatus ? { status: currentStatus } : undefined,
		}),
		[pagination.page, pagination.limit, debouncedSearchTerm, currentStatus, currentSort]
	)

	const {
		recordsData,
		loading,
		error: errorRecords,
		createRecord,
		updateRecord,
		hardDeleteRecord,
		refetchRecords,
	} = useCustomer(paginationParams)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchRecords()
	}, [refetchRecords])

	// Hook de refresh
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

	const modalState = useModalState()

	// Handlers de categorías
	const customerHandlers = useCustomerHandlers({
		modalState,
		createRecord,
		updateRecord,
		hardDeleteRecord,
	})

	// Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(recordsData?.data?.pagination?.hasNextPage)
	}, [handleNextPage, recordsData?.data?.pagination?.hasNextPage])

	// Memoizar datos derivados
	const customerData = useMemo(
		() => ({
			items: recordsData?.data?.items || [],
			pagination: recordsData?.data?.pagination,
			hasNextPage: recordsData?.data?.pagination?.hasNextPage,
		}),
		[recordsData?.data]
	)

	if (errorRecords && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorRecords)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{customerData?.pagination?.totalRecords === 0 ? (
				<Card className='flex h-screen items-center justify-center border-none bg-transparent shadow-none'>
					<UtilBanner
						icon={<Icons.dataBase />}
						title='Sin registros'
						description='No hay datos disponibles. Intentá crear un registro'
					/>

					<ActionButton
						size='lg'
						variant='default'
						icon={<Icons.plus />}
						text='Nuevo cliente'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<CustomerHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filtros y búsqueda */}
					<CustomerFilters
						searchValue={localSearchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onStatusChange={handleStatusChange}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Tabla */}
					<TableCustomer
						customerData={customerData.items}
						loading={loading}
						onEdit={customerHandlers.handleEdit}
						onHardDelete={modalState.openHardDeleteModal}
						viewType={viewType}
					/>

					{/* Controles de paginación */}
					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={recordsData?.data?.pagination}
					/>
				</>
			)}

			{/* Modales */}
			<CustomerModals modalState={modalState} customerHandlers={customerHandlers} />
		</div>
	)
}
