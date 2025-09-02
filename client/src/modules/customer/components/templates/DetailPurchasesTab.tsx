'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

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
	recordsData: { data: { items: Purchase[] } }
	isRefreshing: boolean
	onRefresh: () => void
}

export function PurchasesTab({ recordsData, isRefreshing, onRefresh }: PurchasesTabProps) {
	return (
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
								<TableHead />
							</TableRow>
						</TableHeader>

						<TableBody>
							{recordsData?.data?.items?.map((purchase: Purchase) => (
								<TableRow key={purchase.id} className='hover:bg-muted/50'>
									<TableCell>{purchase.code}</TableCell>
									<TableCell>{purchase.paymentMethod}</TableCell>
									<TableCell>{purchase.totalItems}</TableCell>
									<TableCell>${formatPrice(purchase.subtotal)}</TableCell>
									<TableCell>${formatPrice(purchase.total)}</TableCell>
									<TableCell>{formatDate(purchase.createdAt, true)}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' size='icon'>
													<Icons.dotsVertical className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent align='end'>
												<DropdownMenuItem>Detalles</DropdownMenuItem>
												<DropdownMenuItem>Descargar factura</DropdownMenuItem>
												<DropdownMenuItem>Imprimir</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	)
}
