'use client'

import { useCallback, useMemo, useState } from 'react'

import { useProduct } from '@/common/hooks/useProduct'
import { useHandlers } from '@/modules/product/hooks/useHandlers'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useModalState } from '@/modules/product/hooks/useModalState'
import { usePagination } from '@/modules/product/hooks/usePagination'

import { ProductModals } from '@/modules/product/components/templates/Modals'
import { ProductHeader } from '@/modules/product/components/templates/Header'
import { ProductFilters } from '@/modules/product/components/templates/Filters'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableProduct } from '@/modules/product/components/organisms/Table/TableProduct'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function ProductView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')

	// ✅ URL-synced pagination hooks
	const {
		pagination,
		searchTerm,
		currentSort,
		currentStatus,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleSearchChange,
		handleStatusChange,
		handleSort,
		handleResetAll,
		handlePageChange,
	} = usePagination()

	// ✅ Memoizar parámetros de paginación para evitar recreaciones
	const paginationParams = useMemo(
		() => ({
			page: pagination.page,
			limit: pagination.limit,
			search: searchTerm,
			filters: currentStatus ? { status: currentStatus } : undefined,
			sort: currentSort ? [currentSort] : undefined,
		}),
		[pagination.page, pagination.limit, searchTerm, currentStatus, currentSort]
	)

	// ✅ Main product hook con parámetros memoizados
	const {
		recordsData,
		loading,
		error: errorProduct,
		createRecord,
		updateRecord,
		hardDeleteRecord,
		refetchRecords,
	} = useProduct(paginationParams)

	// ✅ Data refresh hook
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

	// ✅ Form and modal hooks
	const modalState = useModalState()

	// ✅ Handlers optimizados
	const productHandlers = useHandlers({
		modalState,
		createRecord,
		updateRecord,
		hardDeleteRecord,
	})

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(recordsData?.data?.pagination?.hasNextPage)
	}, [handleNextPage, recordsData?.data?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const productData = useMemo(
		() => ({
			items: recordsData?.data?.items || [],
			pagination: recordsData?.data?.pagination,
			hasNextPage: recordsData?.data?.pagination?.hasNextPage,
		}),
		[recordsData?.data]
	)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchRecords()
	}, [refetchRecords])

	if (errorProduct && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorProduct)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{productData?.pagination?.totalRecords === 0 ? (
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
						text='Nuevo producto'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<ProductHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filters and search */}
					<ProductFilters
						searchValue={searchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onStatusChange={handleStatusChange}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Table */}
					<TableProduct
						recordsData={productData.items}
						loading={loading}
						onEdit={productHandlers.handleEdit}
						onHardDelete={modalState.openHardDeleteModal}
						viewType={viewType}
					/>

					{/* Pagination controls */}
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

			{/* Modals */}
			<ProductModals modalState={modalState} productHandlers={productHandlers} />
		</div>
	)
}
