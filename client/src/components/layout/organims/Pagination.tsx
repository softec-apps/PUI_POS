'use client'

import { Icons } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { I_MetaPagination, Pagination } from '@/common/types/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type PaginationControlsProps = {
	loading: boolean
	pagination: Pagination
	onPrevPage: () => void
	onNextPage: () => void
	onLimitChange: (value: string) => void
	metaDataPagination: I_MetaPagination
	onPageChange?: (page: number) => void
	showItemsPerPageSelector?: boolean
	showItemsInfo?: boolean
	showPageNumbers?: boolean
}

export const PaginationControls = ({
	loading,
	pagination,
	onPrevPage,
	onNextPage,
	onLimitChange,
	metaDataPagination,
	onPageChange,
	showItemsPerPageSelector = true,
	showItemsInfo = true,
	showPageNumbers = true,
}: PaginationControlsProps) => {
	const startItem = (pagination?.page - 1) * pagination?.limit + 1
	const endItem = Math.min(pagination?.page * pagination?.limit, metaDataPagination?.totalCount || 0)

	const getVisiblePages = () => {
		const totalPages = metaDataPagination?.totalPages || 1
		const currentPage = pagination?.page
		const pages = []

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i)
		} else {
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
		<div className='flex items-center justify-between'>
			{/* Left: Info text */}
			<div className='text-accent-foreground/80 flex items-center gap-3 font-medium'>
				{showItemsPerPageSelector && (
					<Select value={pagination?.limit?.toString()} onValueChange={onLimitChange} disabled={loading}>
						<SelectTrigger className='bg-background rounded-xl text-xs shadow-none'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className='rounded-xl shadow-none'>
							<SelectItem value='5'>5 / página</SelectItem>
							<SelectItem value='10'>10 / página</SelectItem>
							<SelectItem value='20'>20 / página</SelectItem>
							<SelectItem value='50'>50 / página</SelectItem>
						</SelectContent>
					</Select>
				)}

				{showItemsInfo && (
					<Typography variant='small'>
						{loading ? (
							<Skeleton className='h-8 w-60' />
						) : (
							<>
								Mostrando <span>{startItem}</span> a <span>{endItem}</span> de{' '}
								<span>{metaDataPagination?.totalCount || 0}</span> elementos
							</>
						)}
					</Typography>
				)}
			</div>

			{/* Right: Navigation controls */}
			<div className='flex items-center gap-1'>
				{/* Previous button */}
				<ActionButton
					tooltip='Anterior'
					variant='ghost'
					className='text-accent-foreground/80'
					onClick={onPrevPage}
					disabled={pagination?.page === 1 || loading}
					icon={<Icons.caretLeftFill />}
				/>

				{/* Page numbers */}
				{showPageNumbers &&
					(loading ? (
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
										size='xs'
										text={pageNumber}
										variant={isCurrentPage ? 'default' : 'ghost'}
										className='w-7 rounded-full text-xs transition-all duration-300'
									/>
								)
							})}
						</div>
					))}

				{/* Next button */}
				<ActionButton
					tooltip='Siguiente'
					variant='ghost'
					className='text-accent-foreground/80'
					disabled={!metaDataPagination?.hasNextPage || loading || pagination?.page === metaDataPagination?.totalPages}
					onClick={onNextPage}
					icon={<Icons.caretRightFill />}
				/>
			</div>
		</div>
	)
}
