'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { Typography } from '@/components/ui/typography'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { TableActions } from '@/modules/customer/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/customer/components/organisms/Table/TableInfoDate'

interface TableColumnsProps {
	onEdit: (recordData: I_Customer) => void
	onHardDelete: (recordData: I_Customer) => void
}

export const createTableColumns = ({ onEdit, onHardDelete }: TableColumnsProps): ColumnDef<I_Customer>[] => [
	{
		accessorKey: 'identificationNumber',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Identificación
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
			<div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.identificationNumber}</div>
		),
	},
	{
		accessorKey: 'firstName',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Nombres
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
			<div className='line-clamp-3 max-w-fit break-words whitespace-normal'>
				{row.original.firstName} {row.original.lastName}
			</div>
		),
	},
	{
		accessorKey: 'email',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Email
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
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.email}</div>,
	},
	{
		accessorKey: 'phone',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Teléfono
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
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.phone}</div>,
	},
	{
		accessorKey: 'address',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Dirección
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
			<div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.address}</div>
		),
	},
	{
		accessorKey: 'createdAt',
		header: 'Información',
		cell: ({ row }) => <TableInfoDate recordData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<TableActions recordData={row.original} onEdit={onEdit} onHardDelete={onHardDelete} />
			</div>
		),
	},
]
