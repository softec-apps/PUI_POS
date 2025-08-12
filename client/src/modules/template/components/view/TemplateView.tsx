'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { useTemplate } from '@/common/hooks/useTemplate'
import { UtilBanner } from '@/components/UtilBanner'
import { useHandlers } from '@/modules/template/hooks/useHandlers'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useModalState } from '@/modules/template/hooks/useModalState'
import { usePagination } from '@/modules/category/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { TemplateModals } from '@/modules/template/components/templates/Modals'
import { TemplateHeader } from '@/modules/template/components/templates/Header'
import { TemplateFilters } from '@/modules/template/components/templates/Filters'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { TemplateTable } from '@/modules/template/components/organisms/Table/TableTemplate'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ViewType } from '@/components/layout/organims/ViewSelector'

export function TemplateView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')
	const [localSearchTerm, setLocalSearchTerm] = useState<string>('')
	const debouncedSearchTerm = useDebounce(localSearchTerm, 500)

	const {
		pagination,
		currentSort,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleSort,
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
		}),
		[pagination.page, pagination.limit, debouncedSearchTerm, currentSort]
	)

	const {
		template,
		loading,
		error: errorTemplate,
		createTemplate,
		updateTemplate,
		hardDeleteTemplate,
		refetchTemplate,
	} = useTemplate(paginationParams)

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchTemplate)

	const modalState = useModalState()

	const templateHandlers = useHandlers({
		modalState,
		createTemplate,
		updateTemplate,
		hardDeleteTemplate,
	})

	const handleNext = useCallback(() => {
		handleNextPage(template?.data?.pagination?.hasNextPage)
	}, [handleNextPage, template?.data?.pagination?.hasNextPage])

	const templateData = useMemo(
		() => ({
			items: template?.data?.items || [],
			pagination: template?.data?.pagination,
			hasNextPage: template?.data?.pagination?.hasNextPage,
		}),
		[template?.data]
	)

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
						searchValue={localSearchTerm}
						currentSort={currentSort}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
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
