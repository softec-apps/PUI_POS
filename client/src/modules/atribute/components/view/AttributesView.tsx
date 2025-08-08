'use client'

import { useCallback, useMemo, useState } from 'react'
import { useAttribute } from '@/common/hooks/useAttribute'

import { useModalState } from '@/modules/atribute/hooks/useModalState'
import { usePagination } from '@/modules/atribute/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useAttributeHandlers } from '@/modules/atribute/hooks/useHandlers'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { AtributeHeader } from '@/modules/atribute/components/templates/Header'
import { AttributeModals } from '@/modules/atribute/components/templates/Modals'
import { AttributeFilters } from '@/modules/atribute/components/templates/Filters'
import { PaginationControls } from '@/modules/atribute/components/templates/Pagination'
import { AtributeTable } from '@/modules/atribute/components/organisms/Table/TableAtribute'
import { ViewType } from '@/modules/atribute/components/molecules/ViewSelector'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function AttributesView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')

	// Hooks de paginación
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
		handleStatusChange,
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

	const {
		attributes,
		loading,
		error: errorAtribute,
		createAttribute,
		updateAttribute,
		hardDeleteAttribute,
		refetchAttributes,
	} = useAttribute(paginationParams)

	// Hook de refresh data
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchAttributes)

	// Hooks de formulario y modales
	const modalState = useModalState()

	// Handlers
	const atributesHandlers = useAttributeHandlers({
		modalState,
		createAttribute,
		updateAttribute,
		hardDeleteAttribute,
	})

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(attributes?.data?.pagination?.hasNextPage)
	}, [handleNextPage, attributes?.data?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const atributeData = useMemo(
		() => ({
			items: attributes?.data?.items || [],
			pagination: attributes?.data?.pagination,
			hasNextPage: attributes?.data?.pagination?.hasNextPage,
		}),
		[attributes?.data]
	)

	// Función para reintentar la carga
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
						searchValue={searchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onStatusChange={handleStatusChange}
						onRefresh={handleRefresh}
						onResetAll={handleResetAll}
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
