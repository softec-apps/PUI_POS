/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'

import { useModal } from '@/modules/user/hooks/useModal'
import { useUserData } from '@/modules/user/hooks/useUserData'
import { usePagination } from '@/modules/user/hooks/usePagination'
import { useUserActions } from '@/modules/user/hooks/useUserActions'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { ViewType } from '@/components/layout/organims/ViewSelector'
import { UserHeader } from '@/modules/user/components/templates/Header'
import { UserModals } from '@/modules/user/components/templates/Modals'
import { UserFilters } from '@/modules/user/components/templates/Filters'
import { EmptyState } from '@/modules/user/components/templates/EmptyState'
import { ErrorState } from '@/components/layout/templates/ErrorState'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TableUser } from '@/modules/user/components/organisms/Table/TableUser'

const SEARCH_DELAY = 500
const MAX_RETRIES = 3

export function UserView() {
	const [viewType, setViewType] = useState<ViewType>('table')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [retryCount, setRetryCount] = useState(0)
	const [totalRealRecords, setTotalRealRecords] = useState(0)

	// Hooks
	const pagination = usePagination()
	const modal = useModal()

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(pagination.searchTerm)
		}, SEARCH_DELAY)
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
	const userData = useUserData(dataParams)
	const totalUserData = useUserData(totalParams)
	const { isRefreshing, handleRefresh } = useGenericRefresh(userData.refetchRecords)

	// Actualizar el total real cuando se obtengan los datos
	useEffect(() => {
		if (totalUserData.data.pagination?.totalRecords) setTotalRealRecords(totalUserData.data.pagination.totalRecords)
	}, [totalUserData.data.pagination?.totalRecords])

	const userActions = useUserActions({
		createRecord: userData.createRecord,
		updateRecord: userData.updateRecord,
		softDeleteRecord: userData.softDeleteRecord,
		hardDeleteRecord: userData.hardDeleteRecord,
		restoreRecord: userData.restoreRecord,
	})

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
		totalUserData.refetchRecords()
	}, [handleRefresh, totalUserData])

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
		userData.refetchRecords()
	}, [userData])

	const handleNextPage = useCallback(() => {
		pagination.handleNextPage(userData.data.pagination?.hasNextPage)
	}, [pagination, userData.data.pagination?.hasNextPage])

	// Render states
	if (userData.data.hasError && retryCount < MAX_RETRIES) return <ErrorState onRetry={handleRetry} type='retry' />

	if (userData.data.hasError) return <ErrorState type='fatal' />

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{userData.data.isEmpty ? (
				<EmptyState onCreate={modal.openCreate} />
			) : (
				<>
					<UserHeader
						onCreateClick={modal.openCreate}
						onRefresh={handleFiltersRefresh}
						totalRecords={totalRealRecords}
					/>

					<UserFilters
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

					<TableUser
						recordsData={userData.data.items}
						loading={userData.loading}
						onEdit={modal.openEdit}
						onHardDelete={modal.openHardDelete}
						onSoftDelete={modal.openSoftDelete}
						onRestore={modal.openRestore}
						viewType={viewType}
					/>

					<PaginationControls
						loading={userData.loading}
						pagination={pagination.pagination}
						onPrevPage={pagination.handlePrevPage}
						onPageChange={pagination.handlePageChange}
						onNextPage={handleNextPage}
						onLimitChange={pagination.handleLimitChange}
						metaDataPagination={userData.data.pagination}
					/>
				</>
			)}

			<UserModals
				modal={modal}
				onSubmit={handleModalSubmit}
				onDelete={handleModalDelete}
				onRestore={handleModalRestore}
			/>
		</div>
	)
}
