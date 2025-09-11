'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { I_Kardex } from '@/common/types/modules/kardex'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { InfoDate } from '@/modules/kardex/components/atoms/InfoDate'
import { Actions } from '@/modules/kardex/components/organisms/Actions'
import { MovementTypeBadge } from '@/modules/kardex/components/atoms/MovementTypeBadge'

interface TableColumnsOptions {
	showReason?: boolean
	showProductCode?: boolean
	showMovementType?: boolean
	showQuantity?: boolean
	showStock?: boolean
	showUnitCost?: boolean
	showTotal?: boolean
	showResponsible?: boolean
	showInfo?: boolean
	showActions?: boolean
}

export const createTableColumns = (options: TableColumnsOptions = {}): ColumnDef<I_Kardex>[] => {
	const {
		showReason = true,
		showProductCode = true,
		showMovementType = true,
		showQuantity = true,
		showStock = true,
		showUnitCost = true,
		showTotal = true,
		showResponsible = true,
		showInfo = true,
		showActions = true,
	} = options

	const cols: ColumnDef<I_Kardex>[] = []

	if (showProductCode) {
		cols.push({
			accessorKey: 'product.code',
			header: ({ column }) => (
				<ActionButton
					variant='link'
					size='xs'
					className='p-0'
					text={
						<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
							Cód. Producto
							{column.getIsSorted() === 'asc' ? (
								<Icons.sortAscendingLetters className='ml-1 h-4 w-4' />
							) : column.getIsSorted() === 'desc' ? (
								<Icons.sortDescendingLetters className='ml-1 h-4 w-4' />
							) : null}
						</div>
					}
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				/>
			),
			cell: ({ row }) => <div className='max-w-96 truncate'>{row.original.product.code}</div>,
		})
	}

	if (showReason) {
		cols.push({
			accessorKey: 'reason',
			header: 'Movimiento',
			cell: ({ row }) => <div>{row.original.reason}</div>,
		})
	}

	if (showMovementType) {
		cols.push({
			accessorKey: 'movementType',
			header: 'Movimiento',
			cell: ({ row }) => (
				<div className='max-w-96 truncate'>
					<MovementTypeBadge movementType={row.original.movementType} />
				</div>
			),
		})
	}

	if (showQuantity) {
		cols.push({
			accessorKey: 'quantity',
			header: 'Cant.',
			cell: ({ row }) => <div>{row.original.quantity}</div>,
		})
	}

	if (showStock) {
		cols.push({
			accessorKey: 'stockAfter',
			header: 'Stock',
			cell: ({ row }) => <div>{row.original.stockAfter}</div>,
		})
	}

	if (showUnitCost) {
		cols.push({
			accessorKey: 'unitCost',
			header: 'Costo unt.',
			cell: ({ row }) => <div>${formatPrice(row.original.unitCost)}</div>,
		})
	}

	if (showTotal) {
		cols.push({
			accessorKey: 'total',
			header: 'Total',
			cell: ({ row }) => <div>${formatPrice(row.original.total)}</div>,
		})
	}

	if (showResponsible) {
		cols.push({
			accessorKey: 'user.dni',
			header: 'Responsable',
			cell: ({ row }) => <div>{row?.original?.user?.dni || '-'}</div>,
		})
	}

	if (showInfo) {
		cols.push({
			accessorKey: 'date',
			header: 'Información',
			cell: ({ row }) => <InfoDate recordData={row.original} />,
		})
	}

	if (showActions) {
		cols.push({
			id: 'actions',
			cell: ({ row }) => (
				<div className='flex justify-end'>
					<Actions recordData={row.original} />
				</div>
			),
		})
	}

	return cols
}
