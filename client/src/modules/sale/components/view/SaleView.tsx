/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import { useSaleData } from '@/modules/sale/hooks/useData'
import { usePagination } from '@/modules/sale/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'
import { Header } from '@/modules/sale/components/templates/Header'
import { Filters } from '@/modules/sale/components/templates/Filters'
import { EmptyState } from '@/modules/sale/components/templates/EmptyState'
import { ErrorState } from '@/components/layout/templates/ErrorState'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableData } from '@/modules/sale/components/organisms/Table/TableData'

const SEARCH_DELAY = 500
const MAX_RETRIES = 3

export function SaleView() {
	const [viewType, setViewType] = useState<ViewType>('table')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [retryCount, setRetryCount] = useState(0)
	const [totalRealRecords, setTotalRealRecords] = useState(0)

	// Hooks
	const pagination = usePagination()

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(pagination.searchTerm), SEARCH_DELAY)
		return () => clearTimeout(timer)
	}, [pagination.searchTerm])

	// Data parameters (updated to include date filters)
	const dataParams = useMemo(() => {
		const cleanedDateFilters = Object.fromEntries(
			Object.entries(pagination.dateFilters).filter(([_, range]) => range && (range.startDate || range.endDate))
		)

		return {
			search: debouncedSearch,
			page: pagination.pagination.page,
			limit: pagination.pagination.limit,
			sort: pagination.currentSort ? [pagination.currentSort] : undefined,
			filters: {
				estado_sri: pagination.currentStatusSRI || undefined,
				...cleanedDateFilters,
			},
		}
	}, [debouncedSearch, pagination])

	// Data parameters para obtener el total real (sin filtros)
	const totalParams = useMemo(
		() => ({
			search: '',
			page: 1,
			limit: 1,
			filters: {},
		}),
		[]
	)

	// Data and actions
	const saleData = useSaleData(dataParams)
	const totalSaleData = useSaleData(totalParams)
	const { isRefreshing, handleRefresh } = useGenericRefresh(saleData.refetchRecords)

	// Actualizar el total real cuando se obtengan los datos
	useEffect(() => {
		if (totalSaleData.data.pagination?.totalRecords) setTotalRealRecords(totalSaleData.data.pagination.totalRecords)
	}, [totalSaleData.data.pagination?.totalRecords])

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
		totalSaleData.refetchRecords()
	}, [handleRefresh, totalSaleData])

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		saleData.refetchRecords()
	}, [saleData])

	const handleNextPage = useCallback(() => {
		pagination.handleNextPage(saleData.data.pagination?.hasNextPage)
	}, [pagination, saleData.data.pagination?.hasNextPage])

	// Render states
	if (saleData.data.hasError && retryCount < MAX_RETRIES) return <ErrorState onRetry={handleRetry} type='retry' />

	if (saleData.data.hasError) return <ErrorState type='fatal' />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{saleData.data.isEmpty ? (
				<EmptyState />
			) : (
				<>
					<Header onRefresh={handleFiltersRefresh} totalRecords={totalRealRecords} />

					<Filters
						searchValue={pagination.searchTerm}
						currentSort={pagination.currentSort}
						currentStatusSRI={pagination.currentStatusSRI}
						dateFilters={pagination.dateFilters}
						isRefreshing={isRefreshing}
						onRefresh={handleFiltersRefresh}
						onStatusSRIChange={pagination.handleStatusSRIChange}
						onSearchChange={pagination.handleSearchChange}
						onSort={pagination.handleSort}
						onDateFilterChange={pagination.handleDateFilterChange}
						onClearDateFilter={pagination.clearDateFilter}
						onResetAll={pagination.handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					<TableData recordsData={saleData.data.items} loading={saleData.loading} viewType={viewType} />

					<PaginationControls
						loading={saleData.loading}
						pagination={pagination.pagination}
						onPrevPage={pagination.handlePrevPage}
						onPageChange={pagination.handlePageChange}
						onNextPage={handleNextPage}
						onLimitChange={pagination.handleLimitChange}
						metaDataPagination={saleData.data.pagination}
					/>
				</>
			)}
		</div>
	)
}
