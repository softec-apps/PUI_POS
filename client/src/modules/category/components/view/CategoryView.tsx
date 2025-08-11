'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { useCategory } from '@/common/hooks/useCategory'
import { useFileUpload } from '@/modules/category/hooks/useFileUpload'
import { useModalState } from '@/modules/category/hooks/useModalState'
import { usePagination } from '@/modules/category/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useCategoryHandlers } from '@/modules/category/hooks/useCategoryHandlers'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { CategoryHeader } from '@/modules/category/components/templates/Header'
import { CategoryModals } from '@/modules/category/components/templates/Modals'
import { CategoryFilters } from '@/modules/category/components/templates/Filters'
import { CategoryTable } from '@/modules/category/components/organisms/Table/TableCategory'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function CategoryView() {
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

	// Memoizar parámetros de paginación usando debouncedSearchTerm
	const paginationParams = useMemo(
		() => ({
			search: debouncedSearchTerm,
			page: pagination.page,
			limit: pagination.limit,
			sort: currentSort ? [currentSort] : undefined,
			filters: currentStatus ? { status: currentStatus } : undefined,
		}),
		[pagination.page, pagination.limit, debouncedSearchTerm, currentStatus, currentSort]
	)

	const {
		categories,
		loading,
		error: errorCategory,
		createCategory,
		updateCategory,
		softDeleteCategory,
		hardDeleteCategory,
		restoreCategory,
		refetchCategories,
	} = useCategory(paginationParams)

	// Función para reintentar la carga
	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchCategories()
	}, [refetchCategories])

	// Hook de refresh
	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchCategories)

	// Hooks de formulario y modales
	const { previewImage, isUploading, fileInputRef, uploadFile, clearPreview, triggerFileInput, setPreviewImage } =
		useFileUpload()

	const modalState = useModalState()

	// Handlers de categorías
	const categoryHandlers = useCategoryHandlers({
		modalState,
		clearPreview,
		setPreviewImage,
		uploadFile,
		createCategory,
		updateCategory,
		softDeleteCategory,
		hardDeleteCategory,
		restoreCategory,
	})

	// Optimized next page handler
	const handleNext = useCallback(() => {
		handleNextPage(categories?.data?.pagination?.hasNextPage)
	}, [handleNextPage, categories?.data?.pagination?.hasNextPage])

	// Memoizar datos derivados
	const categoryData = useMemo(
		() => ({
			items: categories?.data?.items || [],
			pagination: categories?.data?.pagination,
			hasNextPage: categories?.data?.pagination?.hasNextPage,
		}),
		[categories?.data]
	)

	console.log(categories)
	if (errorCategory && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorCategory)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{categoryData?.pagination?.totalRecords === 0 ? (
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
						text='Nueva categoría'
						className='rounded-xl'
						onClick={modalState.openCreateDialog}
					/>
				</Card>
			) : (
				<>
					{/* Header */}
					<CategoryHeader onCreateClick={modalState.openCreateDialog} />

					{/* Filtros y búsqueda */}
					<CategoryFilters
						searchValue={localSearchTerm}
						currentSort={currentSort}
						currentStatus={currentStatus}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onStatusChange={handleStatusChange}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
						viewType={viewType}
						onViewChange={setViewType}
					/>

					{/* Tabla */}
					<CategoryTable
						categoryData={categoryData.items}
						loading={loading}
						onEdit={categoryHandlers.handleEdit}
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
						metaDataPagination={categories?.data?.pagination}
					/>
				</>
			)}

			{/* Modales */}
			<CategoryModals
				modalState={modalState}
				previewImage={previewImage}
				isUploading={isUploading}
				fileInputRef={fileInputRef}
				categoryHandlers={categoryHandlers}
				triggerFileInput={triggerFileInput}
			/>
		</div>
	)
}
