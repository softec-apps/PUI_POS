'use client'

import { useCallback, useMemo, useState } from 'react'

import { useUser } from '@/common/hooks/useUser'
import { useHandlers } from '@/modules/user/hooks/useHandlers'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useModalState } from '@/modules/user/hooks/useModalState'
import { usePagination } from '@/modules/user/hooks/usePagination'

import { UserModals } from '@/modules/user/components/templates/Modals'
import { UserHeader } from '@/modules/user/components/templates/Header'
import { UserFilters } from '@/modules/user/components/templates/Filters'
import { TableUser } from '@/modules/user/components/organisms/Table/TableUser'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'
import { PaginationControls } from '@/components/layout/organims/Pagination'

export function UserView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')

	// ✅ URL-synced pagination hooks
	const {
		pagination,
		searchTerm,
		currentSort,
		currentStatus,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleSearchChange,
		handleStatusChange,
		handleSort,
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

	// ✅ Main user hook con parámetros memoizados
	const {
		recordsData,
		loading,
		error: errorUser,
		createRecord,
		updateRecord,
		hardDeleteRecord,
		softDeleteRecord,
		refetchRecords,
	} = useUser(paginationParams)

	// ✅ Data refresh hook
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

	// ✅ Form and modal hooks
	const modalState = useModalState()

	// ✅ Handlers optimizados
	const userHandlers = useHandlers({
		modalState,
		createRecord,
		updateRecord,
		hardDeleteRecord,
		softDeleteRecord,
	})

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(recordsData?.data?.pagination?.hasNextPage)
	}, [handleNextPage, recordsData?.data?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const userData = useMemo(
		() => ({
			items: recordsData?.data?.items || [],
			pagination: recordsData?.data?.pagination,
			hasNextPage: recordsData?.data?.pagination?.hasNextPage,
		}),
		[recordsData?.data]
	)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchRecords()
	}, [refetchRecords])

	if (errorUser && retryCount < 3)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<RetryErrorState onRetry={handleRetry} />
			</Card>
		)

	if (errorUser)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{userData?.pagination?.totalRecords === 0 ? (
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
						text='Nuevo usuario'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<UserHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filters and search */}
					<UserFilters
						searchValue={searchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onStatusChange={handleStatusChange}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Table */}
					<TableUser
						recordsData={userData.items}
						loading={loading}
						onEdit={userHandlers.handleEdit}
						onHardDelete={modalState.openHardDeleteModal}
						onSoftDelete={modalState.openSoftDeleteModal}
						viewType={viewType}
					/>

					{/* Pagination controls */}
					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={recordsData?.data?.pagination}
					/>
				</>
			)}

			{/* Modals */}
			<UserModals modalState={modalState} userHandlers={userHandlers} />
		</div>
	)
}
