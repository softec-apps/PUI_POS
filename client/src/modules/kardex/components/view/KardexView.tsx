'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { useKardex } from '@/common/hooks/useKardex'
import { UtilBanner } from '@/components/UtilBanner'
import { usePagination } from '@/modules/category/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { KardexHeader } from '@/modules/kardex/components/templates/Header'
import { KardexFilters } from '@/modules/kardex/components/templates/Filters'
import { TableKardex } from '@/modules/kardex/components/organisms/Table/TableKardex'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { useDebounce } from '@/common/hooks/useDebounce'
import { I_Kardex } from '@/common/types/modules/kardex'

export function KardexView() {
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
			filters: currentStatus ? { movementType: currentStatus } : undefined,
		}),
		[pagination.page, pagination.limit, debouncedSearchTerm, currentStatus, currentSort]
	)

	const {
		records,
		loading,
		error,
		refetchRecords,
	} = useKardex(paginationParams)

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchRecords()
	}, [refetchRecords])

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

	const handleNext = useCallback(() => {
		handleNextPage(records?.data?.pagination?.hasNextPage)
	}, [handleNextPage, records?.data?.pagination?.hasNextPage])

	const kardexData = useMemo(
		() => ({
			items: records?.data?.items || [],
			pagination: records?.data?.pagination,
			hasNextPage: records?.data?.pagination?.hasNextPage,
		}),
		[records?.data]
	)

	if (error && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (error)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{kardexData?.pagination?.totalRecords === 0 ? (
				<Card className='flex h-screen items-center justify-center border-none bg-transparent shadow-none'>
					<UtilBanner
						icon={<Icons.dataBase />}
						title='Sin registros'
						description='No hay datos disponibles.'
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<KardexHeader />

					{/* Filters and search */}
					<KardexFilters
						searchValue={localSearchTerm}
						currentSort={currentSort}
						currentMovementType={currentStatus as I_Kardex['movementType'] | ''}
						onMovementTypeChange={handleStatusChange}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Table */}
					<TableKardex
						recordData={kardexData.items}
						loading={loading}
						viewType={viewType}
						showResponsible={false}
						showSubtotal={false}
						showTaxRate={false}
						showTaxAmount={false}
						showStockBefore={false}
					/>

					{/* Pagination controls */}
					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={records?.data?.pagination}
					/>
				</>
			)}
		</div>
	)
}
