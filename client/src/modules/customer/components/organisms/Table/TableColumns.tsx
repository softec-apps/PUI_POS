'use client'

import { Icons } from '@/components/icons'
import { Column, ColumnDef } from '@tanstack/react-table'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { TableActions } from '@/modules/customer/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/customer/components/organisms/Table/TableInfoDate'

interface TableColumnsProps {
	onEdit: (recordData: I_Customer) => void
	onHardDelete: (recordData: I_Customer) => void
}

const createHeader = (column: Column<I_Customer>, label: string) => {
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

export const createTableColumns = ({ onEdit, onHardDelete }: TableColumnsProps): ColumnDef<I_Customer>[] => [
	{
		accessorKey: 'identificationNumber',
		header: ({ column }) => createHeader(column, 'Identificación'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.identificationNumber}
			</div>
		),
	},
	{
		accessorKey: 'firstName',
		header: ({ column }) => createHeader(column, 'Nombres'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.firstName} {row.original.lastName}
			</div>
		),
	},
	{
		accessorKey: 'email',
		header: ({ column }) => createHeader(column, 'Email'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.email}
			</div>
		),
	},
	{
		accessorKey: 'phone',
		header: ({ column }) => createHeader(column, 'Teléfono'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.phone}
			</div>
		),
	},
	{
		accessorKey: 'address',
		header: ({ column }) => createHeader(column, 'Dirección'),
		cell: ({ row }) => (
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.address}
			</div>
		),
	},
	{
		accessorKey: 'createdAt',
		header: () => <div className='text-muted-foreground'>Información</div>,
		cell: ({ row }) => <TableInfoDate recordData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<TableActions customerData={row.original} onEdit={onEdit} onHardDelete={onHardDelete} />
			</div>
		),
	},
]
