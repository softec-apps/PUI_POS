'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Customer } from '@/common/types/modules/customer'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'
import { Actions } from '@/modules/sale/components/organisms/Actions'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface ItemsProduct {
	id: string
	productName: string
	productCode: string
	quantity: number
	unitPrice: number
	totalPrice: number
}

interface Purchase {
	id: string
	code: string
	createdAt: string
	subtotal: number
	total: number
	totalItems: number
	paymentMethod: string
	customer: I_Customer
	items: ItemsProduct[]
}

interface PurchasesTabProps {
	recordsData: {
		items: Purchase[]
		pagination: {
			currentPage: number
			totalPages: number
			totalRecords: number
			pageSize: number
			hasNext: boolean
			hasPrev: boolean
		}
	}
	isRefreshing: boolean
	onRefresh: () => void
	onPageChange: (page: number) => void
	onNextPage: () => void
	onPrevPage: () => void
	onLimitChange: (limit: number) => void
	currentPage: number
	currentLimit: number
}

export function PurchasesTab({
	recordsData,
	isRefreshing,
	onRefresh,
	onPageChange,
	onNextPage,
	onPrevPage,
	onLimitChange,
	currentPage,
	currentLimit,
}: PurchasesTabProps) {
	const { isRefreshing: genericRefreshing, handleRefresh } = useGenericRefresh(onRefresh)

	const handleRefreshData = () => {
		handleRefresh()
	}

	return (
		<div className='space-y-4'>
			{/* Header with refresh button */}
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-semibold'> Compras ({recordsData?.pagination?.totalRecords || 0})</h3>
				{/* 
				<Button
					variant='secondary'
					size='sm'
					onClick={handleRefreshData}
					disabled={isRefreshing || genericRefreshing}
					className='flex items-center gap-2'>
					<Icons.refresh className={`h-4 w-4 ${isRefreshing || genericRefreshing ? 'animate-spin' : ''}`} />
					Actualizar
				</Button>
				*/}
			</div>

			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardContent className='p-0'>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Código</TableHead>
									<TableHead>Método</TableHead>
									<TableHead>Productos</TableHead>
									<TableHead>Sub total</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Fecha</TableHead>
									<TableHead>Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recordsData?.items?.length > 0 ? (
									recordsData.items.map((purchase: Purchase) => (
										<TableRow key={purchase.id} className='hover:bg-muted/50'>
											<TableCell>{purchase.code}</TableCell>
											<TableCell>{purchase.paymentMethod}</TableCell>
											<TableCell>{purchase.totalItems}</TableCell>
											<TableCell>${formatPrice(purchase.subtotal)}</TableCell>
											<TableCell>${formatPrice(purchase.total)}</TableCell>
											<TableCell>{formatDate(purchase.createdAt, true)}</TableCell>
											<TableCell>
												<Actions recordData={purchase} />
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={7} className='py-8 text-center'>
											{isRefreshing ? (
												<div className='flex items-center justify-center gap-2'>
													<SpinnerLoader text='Cargando compras...' />
												</div>
											) : (
												<div className='text-muted-foreground flex flex-col items-center gap-2'>
													<Icons.shoppingCart className='h-8 w-8' />
													<span>No hay compras registradas</span>
												</div>
											)}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Pagination Controls */}
			{recordsData?.pagination && (
				<PaginationControls
					loading={isRefreshing}
					pagination={{
						page: currentPage,
						limit: currentLimit,
					}}
					onPrevPage={onPrevPage}
					onPageChange={onPageChange}
					onNextPage={onNextPage}
					onLimitChange={onLimitChange}
					metaDataPagination={recordsData.pagination}
				/>
			)}
		</div>
	)
}
