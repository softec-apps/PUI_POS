'use client'

import { useCallback, useMemo, useState } from 'react'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { useTemplate } from '@/common/hooks/useTemplate'
import { UtilBanner } from '@/components/UtilBanner'
import { useHandlers } from '@/modules/template/hooks/useHandlers'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useModalState } from '@/modules/template/hooks/useModalState'
import { usePagination } from '@/modules/template/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { TemplateModals } from '@/modules/template/components/templates/Modals'
import { TemplateHeader } from '@/modules/template/components/templates/Header'
import { TemplateFilters } from '@/modules/template/components/templates/Filters'
import { PaginationControls } from '@/modules/template/components/templates/Pagination'
import { TemplateTable } from '@/modules/template/components/organisms/Table/TableTemplate'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function TemplateView() {
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
		handleSort,
		handleResetAll,
		handlePageChange,
	} = usePagination()

	// ✅ Memoizar parámetros de paginación para evitar recreaciones
	const paginationParams = useMemo(
		() => ({
			page: pagination.page,
			limit: pagination.limit,
			search: searchTerm,
			filters: currentStatus ? { status: currentStatus } : undefined,
			sort: currentSort ? [currentSort] : undefined,
		}),
		[pagination.page, pagination.limit, searchTerm, currentStatus, currentSort]
	)

	// ✅ Main template hook con parámetros memoizados
	const {
		template,
		loading,
		error: errorTemplate,
		createTemplate,
		updateTemplate,
		hardDeleteTemplate,
		refetchTemplate,
	} = useTemplate(paginationParams)

	// ✅ Data refresh hook
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchTemplate)

	// ✅ Form and modal hooks
	const modalState = useModalState()

	// ✅ Handlers optimizados
	const templateHandlers = useHandlers({
		modalState,
		createTemplate,
		updateTemplate,
		hardDeleteTemplate,
	})

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(template?.data?.pagination?.hasNextPage)
	}, [handleNextPage, template?.data?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const templateData = useMemo(
		() => ({
			items: template?.data?.items || [],
			pagination: template?.data?.pagination,
			hasNextPage: template?.data?.pagination?.hasNextPage,
		}),
		[template?.data]
	)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchTemplate()
	}, [refetchTemplate])

	if (errorTemplate && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorTemplate)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{templateData?.pagination?.totalRecords === 0 ? (
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
						text='Nueva plantilla'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<TemplateHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filters and search */}
					<TemplateFilters
						searchValue={searchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Table */}
					<TemplateTable
						recordData={templateData.items}
						loading={loading}
						onEdit={templateHandlers.handleEdit}
						onHardDelete={modalState.openHardDeleteModal}
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
						metaDataPagination={template?.data?.pagination}
					/>
				</>
			)}

			{/* Modals */}
			<TemplateModals modalState={modalState} templateHandlers={templateHandlers} />
		</div>
	)
}
