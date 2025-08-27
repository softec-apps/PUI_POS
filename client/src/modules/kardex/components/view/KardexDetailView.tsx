'use client'

import { useKardex } from '@/common/hooks/useKardex'
import { useProduct } from '@/common/hooks/useProduct'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { TableData } from '@/modules/kardex/components/organisms/Table/TableData'
import { LoadingStates } from '@/modules/kardex/components/templates/ViewSkeleton'
import { Filters } from '@/modules/kardex/components/templates/Filters'
import { usePagination } from '@/modules/kardex/hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { Badge } from '@/components/layout/atoms/Badge'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'
import Link from 'next/link'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { Icons } from '@/components/icons'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { ViewType } from '@/components/layout/organims/ViewSelector'

type Props = {
	id: string
}

export function KardexDetailView({ id }: Props) {
	const [viewType, setViewType] = useState<ViewType>('table')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	// Hooks de paginación y filtros
	const pagination = usePagination()

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(pagination.searchTerm), 500)
		return () => clearTimeout(timer)
	}, [pagination.searchTerm])

	// Parámetros para obtener datos del kardex
	const kardexParams = useMemo(() => {
		const cleanedDateFilters = Object.fromEntries(
			Object.entries(pagination.dateFilters).filter(([_, range]) => range && (range.startDate || range.endDate))
		)

		return {
			search: debouncedSearch,
			page: pagination.pagination.page,
			limit: pagination.pagination.limit,
			sort: pagination.currentSort ? [pagination.currentSort] : undefined,
			filters: {
				productId: id,
				movementType: pagination.currentMovementType || undefined,
				...cleanedDateFilters,
			},
		}
	}, [debouncedSearch, pagination, id])

	// Obtener datos del kardex
	const {
		recordsData: movementsKardex,
		loading: movementsLoading,
		error: movementsError,
		refetchRecords,
	} = useKardex(kardexParams)

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

	// Obtener datos del producto
	const { getProductById } = useProduct()
	const [product, setProduct] = useState(null)
	const [productLoading, setProductLoading] = useState(true)
	const [productError, setProductError] = useState(null)

	// Obtener datos del producto al montar el componente
	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setProductLoading(true)
				setProductError(null)
				const productData = await getProductById(id)
				setProduct(productData)
			} catch (error) {
				setProductError(error)
			} finally {
				setProductLoading(false)
			}
		}

		if (id) fetchProduct()
	}, [id, getProductById])

	// Handler para refrescar datos
	const handleFiltersRefresh = useCallback(async () => {
		await handleRefresh()
	}, [handleRefresh])

	if (productLoading) {
		return (
			<div className='flex h-screen flex-1 flex-col items-center justify-center'>
				<SpinnerLoader text='Cargando... Por favor espera' />
			</div>
		)
	}

	if (!product) {
		return (
			<div className='flex h-screen flex-1 flex-col items-center justify-center'>
				<NotFoundState />
			</div>
		)
	}

	if (movementsError || productError) {
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)
	}

	return (
		<div className='flex flex-1 flex-col space-y-10'>
			{/* Header */}
			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardContent className='p-0'>
					<div className='flex items-center gap-4'>
						<Link href={ROUTE_PATH.ADMIN.KARDEX} className='text-muted-foreground'>
							<div className='bg-muted hover:bg-accent rounded-full p-4 transition-all duration-500'>
								<Icons.arrowNarrowLeft />
							</div>
						</Link>

						<ImageControl
							imageUrl={product?.photo?.path}
							enableHover={false}
							enableClick={false}
							quality={10}
							imageHeight={80}
							imageWidth={80}
						/>

						<div className='flex-1'>
							<div className='mb-2 line-clamp-1 break-words'>
								<Typography variant='h3'>{product?.name}</Typography>
							</div>

							<div className='flex items-center justify-between'>
								<div className='text-muted-foreground flex items-center gap-2'>
									<Typography variant='overline'>{product?.code}</Typography>

									<span className='mx-1'>•</span>

									{product?.isVariant && <Badge variant='default' text='Producto variante' />}

									<ProductStatusBadge status={product?.status} />

									{product?.deletedAt && <Badge variant='destructive' text='Producto removido' />}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className='space-y-4'>
				{/* Filtros */}
				<Filters
					searchValue={pagination.searchTerm}
					currentSort={pagination.currentSort}
					currentMovementType={pagination.currentMovementType}
					dateFilters={pagination.dateFilters}
					isRefreshing={isRefreshing}
					onRefresh={handleFiltersRefresh}
					onMovementTypeChange={pagination.handleMovementTypeChange}
					onSearchChange={pagination.handleSearchChange}
					onSort={pagination.handleSort}
					onDateFilterChange={pagination.handleDateFilterChange}
					onClearDateFilter={pagination.clearDateFilter}
					onResetAll={pagination.handleResetAll}
					viewType={viewType}
					onViewChange={setViewType}
				/>

				{/* Table */}
				{movementsLoading ? (
					<LoadingStates viewType='table' />
				) : !movementsKardex?.data?.items || movementsKardex.data.items.length === 0 ? (
					<EmptyState />
				) : (
					<>
						<TableData
							recordsData={movementsKardex.data.items}
							loading={movementsLoading}
							viewType={viewType}
							showProductCode={false}
							showActions={false}
						/>

						<PaginationControls
							loading={movementsLoading}
							pagination={pagination.pagination}
							onPrevPage={pagination.handlePrevPage}
							onPageChange={pagination.handlePageChange}
							onNextPage={pagination.handleNextPage}
							onLimitChange={pagination.handleLimitChange}
							metaDataPagination={movementsKardex?.data?.pagination}
						/>
					</>
				)}
			</div>
		</div>
	)
}
