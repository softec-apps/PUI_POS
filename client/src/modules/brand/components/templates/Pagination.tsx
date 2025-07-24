'use client'

import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { I_MetaPagination, Pagination } from '@/common/types/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props = {
	loading: boolean
	pagination: Pagination
	onPrevPage: () => void
	onNextPage: () => void
	onLimitChange: (value: string) => void
	metaDataPagination: I_MetaPagination
	onPageChange?: (page: number) => void
}

export const PaginationControls = ({
	loading,
	pagination,
	onPrevPage,
	onNextPage,
	onLimitChange,
	metaDataPagination,
	onPageChange,
}: Props) => {
	const startItem = (pagination?.page - 1) * pagination?.limit + 1
	const endItem = Math.min(pagination?.page * pagination?.limit, metaDataPagination?.totalCount || 0)

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
			{/* Mobile Layout */}
			<div className='flex flex-col gap-4 p-4 sm:hidden'>
				{/* Top row: Info + Items per page */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<Badge
							variant='outline'
							className='border-primary/20 bg-primary/5 text-primary rounded-full px-3 py-1.5 text-xs font-medium'>
							{startItem}-{endItem} de {metaDataPagination?.totalCount || 0}
						</Badge>
					</div>

					<div className='flex items-center gap-2'>
						<Typography variant='span' className='text-muted-foreground text-xs font-medium'>
							Mostrar
						</Typography>
						<Select value={pagination?.limit?.toString()} onValueChange={onLimitChange}>
							<SelectTrigger className='border-border/50 bg-background hover:bg-muted/30 h-8 w-auto text-xs font-medium transition-all duration-200'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='5'>5</SelectItem>
								<SelectItem value='10'>10</SelectItem>
								<SelectItem value='20'>20</SelectItem>
								<SelectItem value='50'>50</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Bottom row: Navigation controls */}
				<div className='flex items-center justify-between'>
					<Button
						variant='outline'
						size='sm'
						onClick={onPrevPage}
						disabled={pagination?.page === 1}
						className='border-border/50 hover:bg-muted/50 hover:border-border h-9 px-4 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40'>
						<Icons.caretLeftFill className='mr-2 h-3.5 w-3.5' />
						Anterior
					</Button>

					<div className='flex items-center gap-2'>
						<div className='bg-muted/40 border-border/30 flex items-center rounded-lg border px-4 py-2'>
							<span className='text-foreground text-sm font-semibold'>{pagination?.page}</span>
							<span className='text-muted-foreground mx-2 text-xs'>de</span>
							<span className='text-muted-foreground text-sm font-medium'>{metaDataPagination?.totalPages}</span>
						</div>
					</div>

					<Button
						variant='outline'
						size='sm'
						onClick={onNextPage}
						disabled={!metaDataPagination?.hasNextPage}
						className='border-border/50 hover:bg-muted/50 hover:border-border h-9 px-4 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40'>
						Siguiente
						<Icons.caretRightFill className='ml-2 h-3.5 w-3.5' />
					</Button>
				</div>
			</div>

			{/* Desktop Layout */}
			<div className='hidden items-center justify-between sm:flex'>
				{/* Left: Info text */}
				<div className='text-accent-foreground/80 flex items-center gap-3 font-medium'>
					<Select value={pagination?.limit?.toString()} onValueChange={onLimitChange} disabled={loading}>
						<SelectTrigger className='border-border/50 w-auto rounded-xl'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className='rounded-xl'>
							<SelectItem value='5'>5 / página</SelectItem>
							<SelectItem value='10'>10 / página</SelectItem>
							<SelectItem value='20'>20 / página</SelectItem>
							<SelectItem value='50'>50 / página</SelectItem>
						</SelectContent>
					</Select>

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

				{/* Right: Items per page selector */}
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
										size='xs'
										text={pageNumber}
										variant={isCurrentPage ? 'default' : 'ghost'}
										className='w-7 rounded-full text-xs transition-all duration-300'
									/>
								)
							})}
						</div>
					)}

					{/* Next button */}
					<ActionButton
						tooltip='Siguiente'
						variant='ghost'
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
