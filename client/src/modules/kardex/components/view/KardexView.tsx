/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import { useKardexData } from '@/modules/kardex/hooks/useData'
import { usePagination } from '@/modules/kardex/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'
import { Header } from '@/modules/kardex/components/templates/Header'
import { Filters } from '@/modules/kardex/components/templates/Filters'
import { EmptyState } from '@/modules/kardex/components/templates/EmptyState'
import { ErrorState } from '@/components/layout/templates/ErrorState'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableData } from '@/modules/kardex/components/organisms/Table/TableData'

const SEARCH_DELAY = 500
const MAX_RETRIES = 3

export function KardexView() {
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
				movementType: pagination.currentMovementType || undefined,
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
	const kardexData = useKardexData(dataParams)
	const totalKardexData = useKardexData(totalParams)
	const { isRefreshing, handleRefresh } = useGenericRefresh(kardexData.refetchLasted)

	// Actualizar el total real cuando se obtengan los datos
	useEffect(() => {
		if (totalKardexData.lastedData.pagination?.totalRecords)
			setTotalRealRecords(totalKardexData.lastedData.pagination.totalRecords)
	}, [totalKardexData.lastedData.pagination?.totalRecords])

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
		totalKardexData.refetchRecords()
	}, [handleRefresh, totalKardexData])

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		kardexData.refetchRecords()
	}, [kardexData])

	const handleNextPage = useCallback(() => {
		pagination.handleNextPage(kardexData.lastedData.pagination?.hasNextPage)
	}, [pagination, kardexData.lastedData.pagination?.hasNextPage])

	// Render states
	if (kardexData.lastedData.hasError && retryCount < MAX_RETRIES)
		return <ErrorState onRetry={handleRetry} type='retry' />

	if (kardexData.lastedData.hasError) return <ErrorState type='fatal' />

	if (kardexData.lastedData.isEmpty) return <EmptyState />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			<Header onRefresh={handleFiltersRefresh} totalRecords={totalRealRecords} />

			<Filters
				searchValue={pagination.searchTerm}
				currentSort={pagination.currentSort}
				currentMovementType={pagination.currentMovementType}
				dateFilters={pagination.dateFilters}
				isRefreshing={isRefreshing}
				onRefresh={handleFiltersRefresh}
				onMovementTypeChange={pagination.handleMovementTypeChange}
				onSearchChange={pagination.handleSearchChange}
				onSort={pagination.handleSort}
				onDateFilterChange={pagination.handleDateFilterChange}
				onClearDateFilter={pagination.clearDateFilter}
				onResetAll={pagination.handleResetAll}
				viewType={viewType}
				onViewChange={setViewType}
			/>

			<TableData recordsData={kardexData.lastedData.items} loading={kardexData.loading} viewType={viewType} />

			<PaginationControls
				loading={kardexData.loading}
				pagination={pagination.pagination}
				onPrevPage={pagination.handlePrevPage}
				onPageChange={pagination.handlePageChange}
				onNextPage={handleNextPage}
				onLimitChange={pagination.handleLimitChange}
				metaDataPagination={kardexData.lastedData.pagination}
			/>
		</div>
	)
}
