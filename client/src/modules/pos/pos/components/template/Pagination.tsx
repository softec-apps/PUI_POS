'use client'

import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { I_MetaPagination, Pagination } from '@/common/types/pagination'

type Props = {
	loading: boolean
	pagination: Pagination
	onPrevPage: () => void
	onNextPage: () => void
	metaDataPagination: I_MetaPagination
	onPageChange?: (page: number) => void
}

export const PaginationControls = ({
	loading,
	pagination,
	onPrevPage,
	onNextPage,
	metaDataPagination,
	onPageChange,
}: Props) => {
	const startItem = (pagination?.page - 1) * 12 + 1
	const endItem = Math.min(pagination?.page * 12, metaDataPagination?.totalCount || 0)

	// Función para generar números de página visibles
	const getVisiblePages = () => {
		const totalPages = metaDataPagination?.totalPages || 1
		const currentPage = pagination?.page
		const pages = []

		if (totalPages <= 7) {
			// Si hay 7 páginas o menos, mostrar todas
			for (let i = 1; i <= totalPages; i++) pages.push(i)
		} else {
			// Lógica para mostrar páginas con elipsis
			if (currentPage <= 4) {
				pages.push(1, 2, 3, 4, 5, '...', totalPages)
			} else if (currentPage >= totalPages - 3) {
				pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
			} else {
				pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
			}
		}

		return pages
	}

	const handlePageClick = (page: number) => {
		if (onPageChange && page !== pagination?.page) onPageChange(page)
	}

	const visiblePages = getVisiblePages()

	return (
		<>
			{/* Desktop Layout */}
			<div className='items-center justify-between sm:flex'>
				{/* Left: Info text */}
				{/* 
				<div className='text-accent-foreground/80 flex items-center gap-3 font-medium'>
					<Typography variant='muted'>
						{loading ? (
							<>
								<Skeleton className='h-8 w-60' />
							</>
						) : (
							<>
								Mostrando <span>{startItem}</span> a <span>{endItem}</span> de{' '}
								<span>{metaDataPagination?.totalCount || 0}</span> elementos
							</>
						)}
					</Typography>
				</div>
				*/}

				{/* Right: Items per page selector */}
				<div className='flex items-center gap-1'>
					{/* Previous button */}
					<ActionButton
						tooltip='Anterior'
						variant='secondary'
						size='lg'
						className='text-accent-foreground/80'
						onClick={onPrevPage}
						disabled={pagination?.page === 1 || loading}
						icon={<Icons.caretLeftFill />}
					/>

					{/* Page numbers */}
					{loading ? (
						<Skeleton className='h-8 w-40 rounded-full' />
					) : (
						<div className='border-border/50 bg-secondary/20 mx-1 flex items-center gap-1 rounded-full border p-1'>
							{visiblePages.map((page, index) => {
								if (page === '...') {
									return (
										<span key={`ellipsis-${index}`} className='text-muted-foreground px-2 py-1 text-sm'>
											...
										</span>
									)
								}

								const pageNumber = page as number
								const isCurrentPage = pageNumber === pagination?.page

								return (
									<ActionButton
										key={pageNumber}
										onClick={() => handlePageClick(pageNumber)}
										size='sm'
										text={pageNumber}
										variant={isCurrentPage ? 'default' : 'ghost'}
										className='w-9 rounded-full text-xs transition-all duration-300'
									/>
								)
							})}
						</div>
					)}

					{/* Next button */}
					<ActionButton
						tooltip='Siguiente'
						variant='secondary'
						size='lg'
						className='text-accent-foreground/80'
						disabled={
							!metaDataPagination?.hasNextPage || loading || pagination?.page === metaDataPagination?.totalPages
						}
						onClick={onNextPage}
						icon={<Icons.caretRightFill />}
					/>
				</div>
			</div>
		</>
	)
}
