/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import { useModal } from '@/modules/category/hooks/useModal'
import { useCategoryData } from '@/modules/category/hooks/useCategoryData'
import { usePagination } from '@/modules/category/hooks/usePagination'
import { useActions } from '@/modules/category/hooks/useCategoryActions'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'
import { Header } from '@/modules/category/components/templates/Header'
import { Modals } from '@/modules/category/components/templates/Modals'
import { Filters } from '@/modules/category/components/templates/Filters'
import { EmptyState } from '@/modules/category/components/templates/EmptyState'
import { ErrorState } from '@/components/layout/templates/ErrorState'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableData } from '@/modules/category/components/organisms/Table/TableData'
import { Table } from '@/components/ui/table'

const SEARCH_DELAY = 500
const MAX_RETRIES = 3

export function CategoryView() {
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
	const categoryData = useCategoryData(dataParams)
	const totalCategoryData = useCategoryData(totalParams)
	const { isRefreshing, handleRefresh } = useGenericRefresh(categoryData.refetchRecords)

	// Actualizar el total real cuando se obtengan los datos
	useEffect(() => {
		if (totalCategoryData.data.pagination?.totalRecords)
			setTotalRealRecords(totalCategoryData.data.pagination.totalRecords)
	}, [totalCategoryData.data.pagination?.totalRecords])

	const userActions = useActions({
		createRecord: categoryData.createRecord,
		updateRecord: categoryData.updateRecord,
		softDeleteRecord: categoryData.softDeleteRecord,
		hardDeleteRecord: categoryData.hardDeleteRecord,
		restoreRecord: categoryData.restoreRecord,
	})

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
		totalCategoryData.refetchRecords()
	}, [handleRefresh, totalCategoryData])

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
		categoryData.refetchRecords()
	}, [categoryData])

	const handleNextPage = useCallback(() => {
		pagination.handleNextPage(categoryData.data.pagination?.hasNextPage)
	}, [pagination, categoryData.data.pagination?.hasNextPage])

	// Render states
	if (categoryData.data.hasError && retryCount < MAX_RETRIES) return <ErrorState onRetry={handleRetry} type='retry' />

	if (categoryData.data.hasError) return <ErrorState type='fatal' />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{categoryData.data.isEmpty ? (
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
								recordsData={categoryData.data.items}
								loading={categoryData.loading}
								onEdit={modal.openEdit}
								onHardDelete={modal.openHardDelete}
								onSoftDelete={modal.openSoftDelete}
								onRestore={modal.openRestore}
								viewType={viewType}
							/>
						</div>
					</Table>

					<PaginationControls
						loading={categoryData.loading}
						pagination={pagination.pagination}
						onPrevPage={pagination.handlePrevPage}
						onPageChange={pagination.handlePageChange}
						onNextPage={handleNextPage}
						onLimitChange={pagination.handleLimitChange}
						metaDataPagination={categoryData.data.pagination}
					/>
				</>
			)}

			<Modals modal={modal} onSubmit={handleModalSubmit} onDelete={handleModalDelete} onRestore={handleModalRestore} />
		</div>
	)
}
