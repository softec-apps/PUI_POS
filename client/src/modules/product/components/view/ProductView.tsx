'use client'

import { useCallback, useMemo, useState } from 'react'
import { useProduct } from '@/common/hooks/useProduct'

import { useModalState } from '@/modules/product/hooks/useModalState'
import { usePagination } from '@/modules/product/hooks/usePagination'
import { useProductHandlers } from '@/modules/product/hooks/useHandlers'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ProductHeader } from '@/modules/product/components/templates/ProductHeader'
import { ModalsProduct } from '@/modules/product/components/templates/Modals'
import { ProductFilters } from '@/modules/product/components/templates/ProductFilters'
import { PaginationControls } from '@/modules/product/components/templates/Pagination'
import { TableProduct } from '@/modules/product/components/organisms/Table/TableProduct'
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
		products,
		loading,
		error: errorProducts,
		createProduct,
		updateProduct,
		hardDeleteProduct,
		refetchProducts,
	} = useProduct(paginationParams)

	// Hook de refresh data
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchProducts)

	// Hooks de formulario y modales
	const modalState = useModalState()

	// Handlers
	const recordsHandlers = useProductHandlers({
		modalState,
		createRecord: createProduct,
		updateRecord: updateProduct,
		hardDeleteRecord: hardDeleteProduct,
	})

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(products?.pagination?.hasNextPage)
	}, [handleNextPage, products?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const dataPaginated = useMemo(
		() => ({
			items: products?.items || [],
			pagination: products?.pagination,
			hasNextPage: products?.pagination?.hasNextPage,
		}),
		[products]
	)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchProducts()
	}, [refetchProducts])

	if (errorProducts && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorProducts) return <FatalErrorState />

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
						text='Nuevo producto'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<ProductHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filtros y búsqueda */}
					<ProductFilters
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
					<TableProduct
						recordsData={dataPaginated.items}
						loading={loading}
						onEdit={recordsHandlers.handleEdit}
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
						metaDataPagination={products?.pagination}
					/>
				</>
			)}

			{/* Modales */}
			<ModalsProduct modalState={modalState} recordHandlers={recordsHandlers} />
		</div>
	)
}
