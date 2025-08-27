'use client'

import { Icons } from '@/components/icons'
import { Column, ColumnDef } from '@tanstack/react-table'
import { I_Sale } from '@/common/types/modules/sale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Actions } from '@/modules/sale/components/organisms/Actions'
import { InfoDate } from '@/modules/sale/components/atoms/InfoDate'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { MethodPaymentBadge } from '@/modules/sale/components/atoms/MethodPaymentBadge'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { Typography } from '@/components/ui/typography'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import Link from 'next/link'

const createHeader = (column: Column<I_Sale>, label: string) => {
	return (
		<ActionButton
			variant='link'
			size='xs'
			className='p-0'
			text={
				<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
					{label}
					{column.getIsSorted() === 'asc' ? (
						<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
					) : column.getIsSorted() === 'desc' ? (
						<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
					) : null}
				</div>
			}
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
		/>
	)
}

export const createTableColumns = (): ColumnDef<I_Sale>[] => [
	{
		accessorKey: 'code',
		header: ({ column }) => createHeader(column, 'Código'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.code}
			</div>
		),
	},
	{
		accessorKey: 'paymentMethod',
		header: ({ column }) => createHeader(column, 'Método'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				<MethodPaymentBadge type={row.original.paymentMethod} />
			</div>
		),
	},
	{
		accessorKey: 'customer.identificationNumber',
		header: ({ column }) => createHeader(column, 'Cliente'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.customer.firstName} {row.original.customer.lastName}
			</div>
		),
	},
	{
		accessorKey: 'totalItems',
		header: ({ column }) => createHeader(column, 'Productos'),
		cell: ({ row }) => (
			<HoverCard>
				<HoverCardTrigger asChild>
					<Button variant='ghost' size='xs'>
						{row.original.totalItems} {row.original.totalItems > 1 ? 'items' : 'item'} <Icons.infoCircle />
					</Button>
				</HoverCardTrigger>

				<HoverCardContent className='w-72 p-0'>
					<ul className='divide-border divide-y'>
						{row.original.items.map((item, idx) => (
							<li key={idx}>
								<Link
									href={`${ROUTE_PATH.ADMIN.PRODUCT}/${item.product?.id ?? ''}`}
									className='hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors'>
									{/* Imagen del producto */}
									{item.product?.photo && (
										<ImageControl
											recordData={item.product.photo}
											enableHover={false}
											enableClick={false}
											imageHeight={40}
											imageWidth={40}
											className='rounded-md border'
										/>
									)}

									{/* Info */}
									<div className='flex flex-col'>
										<Typography variant='span' className='text-primary'>
											{item.product?.name ?? item.productName}
										</Typography>

										<Typography variant='span'>
											{item.quantity} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.totalPrice)}
										</Typography>
									</div>
								</Link>
							</li>
						))}
					</ul>
				</HoverCardContent>
			</HoverCard>
		),
	},
	{
		accessorKey: 'subtotal',
		header: ({ column }) => createHeader(column, 'Subtotal'),
		cell: ({ row }) => <span>${row.original.subtotal.toFixed(2)}</span>,
	},
	{
		accessorKey: 'taxAmount',
		header: ({ column }) => createHeader(column, 'Impuesto'),
		cell: ({ row }) => <span>${formatPrice(row.original.taxAmount)}</span>,
	},
	{
		accessorKey: 'total',
		header: ({ column }) => createHeader(column, 'Total'),
		cell: ({ row }) => <span>${formatPrice(row.original.total)}</span>,
	},
	{
		accessorKey: 'createdAt',
		header: () => <div className='text-muted-foreground'>Información</div>,
		cell: ({ row }) => <InfoDate recordData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<Actions recordData={row.original} />
			</div>
		),
	},
]
