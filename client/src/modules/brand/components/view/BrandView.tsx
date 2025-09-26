/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import { useModal } from '@/modules/brand/hooks/useModal'
import { useBrandData } from '@/modules/brand/hooks/useData'
import { usePagination } from '@/modules/brand/hooks/usePagination'
import { useActions } from '@/modules/brand/hooks/useActions'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'
import { Header } from '@/modules/brand/components/templates/Header'
import { Modals } from '@/modules/brand/components/templates/Modals'
import { Filters } from '@/modules/brand/components/templates/Filters'
import { EmptyState } from '@/modules/brand/components/templates/EmptyState'
import { ErrorState } from '@/components/layout/templates/ErrorState'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableData } from '@/modules/brand/components/organisms/Table/TableData'
import { Table } from '@/components/ui/table'

const SEARCH_DELAY = 500
const MAX_RETRIES = 3

export function BrandView() {
	const [viewType, setViewType] = useState<ViewType>('table')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [retryCount, setRetryCount] = useState(0)
	const [totalRealRecords, setTotalRealRecords] = useState(0)

	// Hooks
	const pagination = usePagination()
	const modal = useModal()

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
				status: pagination.currentStatus || undefined,
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
	const brandData = useBrandData(dataParams)
	const totalBrandData = useBrandData(totalParams)
	const { isRefreshing, handleRefresh } = useGenericRefresh(brandData.refetchRecords)

	// Actualizar el total real cuando se obtengan los datos
	useEffect(() => {
		if (totalBrandData.data.pagination?.totalRecords) setTotalRealRecords(totalBrandData.data.pagination.totalRecords)
	}, [totalBrandData.data.pagination?.totalRecords])

	const userActions = useActions({
		createRecord: brandData.createRecord,
		updateRecord: brandData.updateRecord,
		softDeleteRecord: brandData.softDeleteRecord,
		hardDeleteRecord: brandData.hardDeleteRecord,
		restoreRecord: brandData.restoreRecord,
	})

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
		totalBrandData.refetchRecords()
	}, [handleRefresh, totalBrandData])

	const handleModalSubmit = useCallback(
		async (data: any) => {
			try {
				modal.setLoading(true)
				await userActions.handleSubmit(data, modal.record?.id)
				modal.closeModal()
			} catch (error) {
				throw error
			} finally {
				modal.setLoading(false)
			}
		},
		[modal, userActions]
	)

	const handleModalDelete = useCallback(async () => {
		if (!modal.record?.id || !modal.type) return

		try {
			modal.setLoading(true)
			const deleteType = modal.type === 'hardDelete' ? 'hard' : 'soft'
			await userActions.handleDelete(modal.record.id, deleteType)
			modal.closeModal()
		} catch (error) {
		} finally {
			modal.setLoading(false)
		}
	}, [modal, userActions])

	const handleModalRestore = useCallback(async () => {
		if (!modal.record?.id) return

		try {
			modal.setLoading(true)
			await userActions.handleRestore(modal.record.id)
			modal.closeModal()
		} catch (error) {
		} finally {
			modal.setLoading(false)
		}
	}, [modal, userActions])

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		brandData.refetchRecords()
	}, [brandData])

	const handleNextPage = useCallback(() => {
		pagination.handleNextPage(brandData.data.pagination?.hasNextPage)
	}, [pagination, brandData.data.pagination?.hasNextPage])

	// Render states
	if (brandData.data.hasError && retryCount < MAX_RETRIES) return <ErrorState onRetry={handleRetry} type='retry' />
	if (brandData.data.hasError) return <ErrorState type='fatal' />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{brandData.data.isEmpty ? (
				<EmptyState onCreate={modal.openCreate} />
			) : (
				<>
					<Header onCreateClick={modal.openCreate} onRefresh={handleFiltersRefresh} totalRecords={totalRealRecords} />

					<Filters
						searchValue={pagination.searchTerm}
						currentSort={pagination.currentSort}
						currentStatus={pagination.currentStatus}
						dateFilters={pagination.dateFilters}
						isRefreshing={isRefreshing}
						onRefresh={handleFiltersRefresh}
						onStatusChange={pagination.handleStatusChange}
						onSearchChange={pagination.handleSearchChange}
						onSort={pagination.handleSort}
						onDateFilterChange={pagination.handleDateFilterChange}
						onClearDateFilter={pagination.clearDateFilter}
						onResetAll={pagination.handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					<Table className='w-full table-fixed overflow-hidden'>
						<div className='pr-12'>
							<TableData
								recordsData={brandData.data.items}
								loading={brandData.loading}
								onEdit={modal.openEdit}
								onHardDelete={modal.openHardDelete}
								onSoftDelete={modal.openSoftDelete}
								onRestore={modal.openRestore}
								viewType={viewType}
							/>
						</div>
					</Table>

					<PaginationControls
						loading={brandData.loading}
						pagination={pagination.pagination}
						onPrevPage={pagination.handlePrevPage}
						onPageChange={pagination.handlePageChange}
						onNextPage={handleNextPage}
						onLimitChange={pagination.handleLimitChange}
						metaDataPagination={brandData.data.pagination}
					/>
				</>
			)}

			<Modals modal={modal} onSubmit={handleModalSubmit} onDelete={handleModalDelete} onRestore={handleModalRestore} />
		</div>
	)
}
