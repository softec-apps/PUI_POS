/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import { useModal } from '@/modules/supplier/hooks/useModal'
import { useSupplierData } from '@/modules/supplier/hooks/useData'
import { usePagination } from '@/modules/supplier/hooks/usePagination'
import { useActions } from '@/modules/supplier/hooks/useActions'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'
import { Header } from '@/modules/supplier/components/templates/Header'
import { Modals } from '@/modules/supplier/components/templates/Modals'
import { Filters } from '@/modules/supplier/components/templates/Filters'
import { EmptyState } from '@/modules/supplier/components/templates/EmptyState'
import { ErrorState } from '@/components/layout/templates/ErrorState'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableData } from '@/modules/supplier/components/organisms/Table/TableData'

const SEARCH_DELAY = 500
const MAX_RETRIES = 3

export function SupplierView() {
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
	const supplierData = useSupplierData(dataParams)
	const totalSupplierData = useSupplierData(totalParams)
	const { isRefreshing, handleRefresh } = useGenericRefresh(supplierData.refetchRecords)

	// Actualizar el total real cuando se obtengan los datos
	useEffect(() => {
		if (totalSupplierData.data.pagination?.totalRecords)
			setTotalRealRecords(totalSupplierData.data.pagination.totalRecords)
	}, [totalSupplierData.data.pagination?.totalRecords])

	const userActions = useActions({
		createRecord: supplierData.createRecord,
		updateRecord: supplierData.updateRecord,
		softDeleteRecord: supplierData.softDeleteRecord,
		hardDeleteRecord: supplierData.hardDeleteRecord,
		restoreRecord: supplierData.restoreRecord,
	})

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
		totalSupplierData.refetchRecords()
	}, [handleRefresh, totalSupplierData])

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
		supplierData.refetchRecords()
	}, [supplierData])

	const handleNextPage = useCallback(() => {
		pagination.handleNextPage(supplierData.data.pagination?.hasNextPage)
	}, [pagination, supplierData.data.pagination?.hasNextPage])

	// Render states
	if (supplierData.data.hasError && retryCount < MAX_RETRIES) return <ErrorState onRetry={handleRetry} type='retry' />

	if (supplierData.data.hasError) return <ErrorState type='fatal' />

	if (supplierData.data.isEmpty) return <EmptyState onCreate={modal.openCreate} />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
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

			<TableData
				recordsData={supplierData.data.items}
				loading={supplierData.loading}
				onEdit={modal.openEdit}
				onHardDelete={modal.openHardDelete}
				onSoftDelete={modal.openSoftDelete}
				onRestore={modal.openRestore}
				viewType={viewType}
			/>

			<PaginationControls
				loading={supplierData.loading}
				pagination={pagination.pagination}
				onPrevPage={pagination.handlePrevPage}
				onPageChange={pagination.handlePageChange}
				onNextPage={handleNextPage}
				onLimitChange={pagination.handleLimitChange}
				metaDataPagination={supplierData.data.pagination}
			/>

			<Modals modal={modal} onSubmit={handleModalSubmit} onDelete={handleModalDelete} onRestore={handleModalRestore} />
		</div>
	)
}
