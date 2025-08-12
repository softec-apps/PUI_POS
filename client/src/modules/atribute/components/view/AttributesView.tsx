'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { useAttribute } from '@/common/hooks/useAttribute'
import { useModalState } from '@/modules/atribute/hooks/useModalState'
import { usePagination } from '@/modules/category/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useAttributeHandlers } from '@/modules/atribute/hooks/useHandlers'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { AtributeHeader } from '@/modules/atribute/components/templates/Header'
import { AttributeModals } from '@/modules/atribute/components/templates/Modals'
import { AttributeFilters } from '@/modules/atribute/components/templates/Filters'
import { AtributeTable } from '@/modules/atribute/components/organisms/Table/TableAtribute'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function AttributesView() {
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

	const paginationParams = useMemo(() => {
		const params: any = {
			search: debouncedSearchTerm,
			page: pagination.page,
			limit: pagination.limit,
			sort: currentSort ? [currentSort] : undefined,
		}
		if (currentStatus === 'true' || currentStatus === 'false') {
			params.filters = { required: currentStatus === 'true' }
		}
		return params
	}, [pagination.page, pagination.limit, debouncedSearchTerm, currentStatus, currentSort])

	const {
		attributes,
		loading,
		error: errorAtribute,
		createAttribute,
		updateAttribute,
		hardDeleteAttribute,
		refetchAttributes,
	} = useAttribute(paginationParams)

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchAttributes)

	const modalState = useModalState()

	const atributesHandlers = useAttributeHandlers({
		modalState,
		createAttribute,
		updateAttribute,
		hardDeleteAttribute,
	})

	const handleNext = useCallback(() => {
		handleNextPage(attributes?.data?.pagination?.hasNextPage)
	}, [handleNextPage, attributes?.data?.pagination?.hasNextPage])

	const atributeData = useMemo(
		() => ({
			items: attributes?.data?.items || [],
			pagination: attributes?.data?.pagination,
			hasNextPage: attributes?.data?.pagination?.hasNextPage,
		}),
		[attributes?.data]
	)

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchAttributes()
	}, [refetchAttributes])

	if (errorAtribute && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorAtribute)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{atributeData?.pagination?.totalRecords === 0 ? (
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
						text='Nuevo atributo'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<AtributeHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filtros y búsqueda */}
					<AttributeFilters
						searchValue={localSearchTerm}
						currentSort={currentSort}
						currentRequired={currentStatus as 'true' | 'false' | ''}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRequiredChange={handleStatusChange}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Tabla */}
					<AtributeTable
						atributeData={atributeData.items}
						loading={loading}
						onEdit={atributesHandlers.handleEdit}
						onHardDelete={modalState.openHardDeleteModal}
						viewType={viewType}
					/>

					{/* Controles de paginación */}
					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={attributes?.data?.pagination}
					/>
				</>
			)}

			{/* Modales */}
			<AttributeModals modalState={modalState} atributesHandlers={atributesHandlers} />
		</div>
	)
}
