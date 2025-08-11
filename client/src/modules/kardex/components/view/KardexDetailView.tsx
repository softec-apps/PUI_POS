'use client'

import { useKardex } from '@/common/hooks/useKardex'
import { useProduct } from '@/common/hooks/useProduct' // Importar useProduct
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { TableKardex } from '../organisms/Table/TableKardex'
import { LoadingStates } from '../organisms/Table/StateLoading'
import { KardexFilters } from '../templates/Filters'
import { usePagination } from '../../hooks/usePagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from '@/common/hooks/useDebounce'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/layout/atoms/Badge'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { PaginationControls } from '../templates/Pagination'
import { ProductStatusBadge } from '@/modules/product/components/atoms/ProductStatusBadge'
import Link from 'next/link'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { Icons } from '@/components/icons'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

type Props = {
	id: string
}

export function KardexDetailView({ id }: Props) {
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

	const debouncedSearchTerm = useDebounce(searchTerm, 500)

	// Obtener datos del producto por ID
	const { getProductById } = useProduct()
	const [product, setProduct] = useState(null)
	const [productLoading, setProductLoading] = useState(true)
	const [productError, setProductError] = useState(null)

	const paginationParams = useMemo(
		() => ({
			page: pagination.page,
			limit: pagination.limit,
			search: debouncedSearchTerm,
			filters: {
				...(currentMovementType ? { movementType: currentMovementType } : {}),
				productId: id,
			},
			sort: currentSort ? [currentSort] : undefined,
		}),
		[pagination.page, pagination.limit, debouncedSearchTerm, currentMovementType, currentSort, id]
	)

	const {
		records: movementsKardex,
		loading: movementsLoading,
		error: movementsError,
		refetchRecords,
	} = useKardex(paginationParams)

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchRecords)

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
							recordData={product}
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
				/>

				{/* Table */}
				{movementsLoading ? (
					<LoadingStates viewType='table' />
				) : !movementsKardex?.data?.items || movementsKardex.data.items.length === 0 ? (
					searchTerm ? (
						<EmptyState />
					) : (
						<EmptyState />
					)
				) : (
					<>
						<TableKardex
							recordData={movementsKardex.data.items}
							loading={movementsLoading}
							viewType={'table'}
							showActions={false}
							showProductCode={false}
						/>

						<PaginationControls
							loading={movementsLoading}
							pagination={pagination}
							onPrevPage={handlePrevPage}
							onPageChange={handlePageChange}
							onNextPage={handleNextPage}
							onLimitChange={handleLimitChange}
							metaDataPagination={movementsKardex?.data?.pagination}
						/>
					</>
				)}
			</div>
		</div>
	)
}
