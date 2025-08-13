'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Sale } from '@/common/types/modules/sale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { TableActions } from './TableActions' // This file will be created later
import { Typography } from '@/components/ui/typography'
import { formatDate } from '@/common/utils/dateFormater-util'

interface TableColumnsProps {
	onEdit: (saleData: I_Sale) => void
	onHardDelete: (saleData: I_Sale) => void
}

export const createTableColumns = ({ onEdit, onHardDelete }: TableColumnsProps): ColumnDef<I_Sale>[] => [
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						ID
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</Typography>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.id}</div>,
	},
    {
		accessorKey: 'customer',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Cliente
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</Typography>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.customer.firstName} {row.original.customer.lastName}</div>,
	},
    {
		accessorKey: 'seller',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Vendedor
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</Typography>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.seller.name}</div>,
	},
    {
		accessorKey: 'total',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Total
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</Typography>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>${row.original.total}</div>,
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Estado
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</Typography>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				<Badge
					variant={row.original.status === 'completed' ? 'success' : row.original.status === 'pending' ? 'warning' : 'destructive'}
					text={row.original.status}
				/>
			</div>
		),
	},
	{
		accessorKey: 'createdAt',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Fecha
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</Typography>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<TableActions saleData={row.original} onEdit={onEdit} onHardDelete={onHardDelete} />
			</div>
		),
	},
]
