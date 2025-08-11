'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { useBrand } from '@/common/hooks/useBrand'
import { useModalState } from '@/modules/brand/hooks/useModalState'
import { usePagination } from '@/modules/category/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useBrandHandlers } from '@/modules/brand/hooks/useBrandHandlers'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { BrandHeader } from '@/modules/brand/components/templates/Header'
import { BrandModals } from '@/modules/brand/components/templates/Modals'
import { BrandFilters } from '@/modules/brand/components/templates/Filters'
import { BrandTable } from '@/modules/brand/components/organisms/Table/TableBrand'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function BrandView() {
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
		brands,
		loading,
		error: errorBrand,
		createBrand,
		updateBrand,
		hardDeleteBrand,
		refetchBrands,
	} = useBrand(paginationParams)

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchBrands()
	}, [refetchBrands])

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchBrands)

	const modalState = useModalState()

	const brandHandlers = useBrandHandlers({
		modalState,
		createBrand,
		updateBrand,
		hardDeleteBrand,
	})

	const handleNext = useCallback(() => {
		handleNextPage(brands?.data?.pagination?.hasNextPage)
	}, [handleNextPage, brands?.data?.pagination?.hasNextPage])

	const brandData = useMemo(
		() => ({
			items: brands?.data?.items || [],
			pagination: brands?.data?.pagination,
			hasNextPage: brands?.data?.pagination?.hasNextPage,
		}),
		[brands?.data]
	)

	if (errorBrand && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorBrand)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{brandData?.pagination?.totalRecords === 0 ? (
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
						text='Nueva marca'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<BrandHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filtros y búsqueda */}
					<BrandFilters
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
					<BrandTable
						brandData={brandData.items}
						loading={loading}
						onEdit={brandHandlers.handleEdit}
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
						metaDataPagination={brands?.data?.pagination}
					/>
				</>
			)}

			{/* Modales */}
			<BrandModals modalState={modalState} brandHandlers={brandHandlers} />
		</div>
	)
}
