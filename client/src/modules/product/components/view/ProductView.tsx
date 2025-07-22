'use client'

import { useCallback, useMemo, useState } from 'react'
import { useSupplier } from '@/common/hooks/useSupplier'

import { useModalState } from '@/modules/product/hooks/useModalState'
import { usePagination } from '@/modules/product/hooks/usePagination'
import { useSupplierHandlers } from '@/modules/product/hooks/useHandlers'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { SupplierHeader } from '@/modules/product/components/templates/Header'
import { ModalsSupplier } from '@/modules/product/components/templates/Modals'
import { AttributeFilters } from '@/modules/product/components/templates/Filters'
import { PaginationControls } from '@/modules/product/components/templates/Pagination'
import { TableSupplier } from '@/modules/product/components/organisms/Table/TableSupplier'
import { ViewType } from '@/modules/product/components/molecules/ViewSelector'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function ProductView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')

	// Hooks de paginación
	const {
		pagination,
		searchTerm,
		currentSort,
		currentStatus,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleSearchChange,
		handleSort,
		handleStatusChange,
		handleResetAll,
		handlePageChange,
	} = usePagination()

	// ✅ Memoizar parámetros de paginación para evitar recreaciones
	const paginationParams = useMemo(
		() => ({
			search: searchTerm,
			page: pagination.page,
			limit: pagination.limit,
			sort: currentSort ? [currentSort] : undefined,
			filters: currentStatus ? { status: currentStatus } : undefined,
		}),
		[pagination.page, pagination.limit, searchTerm, currentStatus, currentSort]
	)

	const {
		supplierData,
		loading,
		error: errorSupplier,
		createRecord,
		updateRecord,
		hardDeleteRecord,
		refetchRecords,
	} = useSupplier(paginationParams)

	// Hook de refresh data
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

	// Hooks de formulario y modales
	const modalState = useModalState()

	// Handlers
	const atributesHandlers = useSupplierHandlers({
		modalState,
		createRecord,
		updateRecord,
		hardDeleteRecord,
	})

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(supplierData?.data?.pagination?.hasNextPage)
	}, [handleNextPage, supplierData?.data?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const dataPaginated = useMemo(
		() => ({
			items: supplierData?.data?.items || [],
			pagination: supplierData?.data?.pagination,
			hasNextPage: supplierData?.data?.pagination?.hasNextPage,
		}),
		[supplierData?.data]
	)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchRecords()
	}, [refetchRecords])

	if (errorSupplier && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorSupplier) return <FatalErrorState />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{dataPaginated?.pagination?.totalRecords === 0 ? (
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
						text='Nuevo proveedor'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<SupplierHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filtros y búsqueda */}
					<AttributeFilters
						searchValue={searchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onStatusChange={handleStatusChange}
						onRefresh={handleRefresh}
						onResetAll={handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Tabla */}
					<TableSupplier
						recordsData={dataPaginated.items}
						loading={loading}
						onEdit={atributesHandlers.handleEdit}
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
						metaDataPagination={supplierData?.data?.pagination}
					/>
				</>
			)}

			{/* Modales */}
			<ModalsSupplier modalState={modalState} recordHandlers={atributesHandlers} />
		</div>
	)
}
