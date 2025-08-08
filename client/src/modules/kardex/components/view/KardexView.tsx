'use client'

import { useCallback, useMemo, useState } from 'react'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { useKardex } from '@/common/hooks/useKardex'
import { UtilBanner } from '@/components/UtilBanner'
import { usePagination } from '@/modules/kardex/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { KardexHeader } from '@/modules/kardex/components/templates/Header'
import { KardexFilters } from '@/modules/kardex/components/templates/Filters'
import { TableKardex } from '@/modules/kardex/components/organisms/Table/TableKardex'
import { PaginationControls } from '@/modules/kardex/components/templates/Pagination'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'
import { ViewType } from '@/modules/kardex/components/molecules/ViewSelector'

export function KardexView() {
	const [retryCount, setRetryCount] = useState(0)
	const [viewType, setViewType] = useState<ViewType>('table')

	// ✅ URL-synced pagination hooks
	const {
		pagination,
		searchTerm,
		currentSort,
		currentMovementType,
		handleMovementTypeChange,
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
			filters: currentMovementType ? { movementType: currentMovementType } : undefined,
			sort: currentSort ? [currentSort] : undefined,
		}),

		[pagination.page, pagination.limit, searchTerm, currentMovementType, currentSort]
	)

	// ✅ Main kardex hook con parámetros memoizados
	const {
		lastedRecords: records,
		loadingLasted: loading,
		errorLasted: error,
		refetchLasted,
	} = useKardex(paginationParams)

	// ✅ Data refresh hook
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchLasted)

	// ✅ Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(records?.data?.pagination?.hasNextPage)
	}, [handleNextPage, records?.data?.pagination?.hasNextPage])

	// ✅ Memoizar datos derivados
	const kardexData = useMemo(
		() => ({
			items: records?.data?.items || [],
			pagination: records?.data?.pagination,
			hasNextPage: records?.data?.pagination?.hasNextPage,
		}),
		[records?.data]
	)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchLasted()
	}, [refetchLasted])

	if (error && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (error)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{kardexData?.pagination?.totalRecords === 0 ? (
				<Card className='flex h-screen items-center justify-center border-none bg-transparent shadow-none'>
					<UtilBanner
						icon={<Icons.dataBase />}
						title='Sin registros'
						description='No hay datos disponibles.
						'
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<KardexHeader title='Kardex' subtitle='Gestiona los movimientos de tus productos' />

					{/* Filters and search */}
					<KardexFilters
						searchValue={searchTerm}
						currentSort={currentSort}
						currentMovementType={currentMovementType}
						onMovementTypeChange={handleMovementTypeChange}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAll}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Table */}
					<TableKardex
						recordData={kardexData.items}
						loading={loading}
						viewType={viewType}
						showResponsible={false}
						showSubtotal={false}
						showTaxRate={false}
						showTaxAmount={false}
						showStockBefore={false}
					/>

					{/* Pagination controls */}
					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={records?.data?.pagination}
					/>
				</>
			)}
		</div>
	)
}
