'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { useSale } from '@/common/hooks/useSale'
import { useModalState } from '@/modules/sales/hooks/useModalState'
import { usePagination } from '@/modules/sales/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useSaleHandlers } from '@/modules/sales/hooks/useSaleHandlers'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { SalesHeader } from '@/modules/sales/components/templates/Header'
import { SalesModals } from '@/modules/sales/components/templates/Modals'
import { SalesFilters } from '@/modules/sales/components/templates/Filters'
import { SalesTable } from '@/modules/sales/components/organisms/Table/TableSales'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function SalesView() {
	const [retryCount, setRetryCount] = useState(0)

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
		sales,
		loading,
		error: errorSale,
		createSale,
		updateSale,
		hardDeleteSale,
		refetchSales,
	} = useSale(paginationParams)

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchSales()
	}, [refetchSales])

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchSales)

	const modalState = useModalState()

	const saleHandlers = useSaleHandlers({
		modalState,
		createSale,
		updateSale,
		hardDeleteSale,
	})

	const handleNext = useCallback(() => {
		handleNextPage(sales?.data?.pagination?.hasNextPage)
	}, [handleNextPage, sales?.data?.pagination?.hasNextPage])

	const saleData = useMemo(
		() => ({
			items: sales?.data?.items || [],
			pagination: sales?.data?.pagination,
			hasNextPage: sales?.data?.pagination?.hasNextPage,
		}),
		[sales?.data]
	)

	if (errorSale && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorSale)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{saleData?.pagination?.totalRecords === 0 ? (
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
						text='Nueva venta'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					<SalesHeader onCreateClick={modalState.openCreateDialog} />

					<SalesFilters
						searchValue={localSearchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onStatusChange={handleStatusChange}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
					/>

					<SalesTable
						saleData={saleData.items}
						loading={loading}
						onEdit={saleHandlers.handleEdit}
						onHardDelete={modalState.openHardDeleteModal}
					/>

					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={sales?.data?.pagination}
					/>
				</>
			)}

			<SalesModals
				modalState={modalState}
				saleHandlers={saleHandlers}
			/>
		</div>
	)
}
