'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Supplier } from '@/common/types/modules/supplier'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { TableActions } from '@/modules/supplier/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/supplier/components/organisms/Table/TableInfoDate'

interface TableColumnsProps {
	onEdit: (recordData: I_Supplier) => void
	onHardDelete: (recordData: I_Supplier) => void
}

export const createTableColumns = ({ onEdit, onHardDelete }: TableColumnsProps): ColumnDef<I_Supplier>[] => [
	{
		accessorKey: 'ruc',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						RUC
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</div>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='max-w-96 truncate'>{row.original.ruc}</div>,
	},
	{
		accessorKey: 'legalName',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Razón socia
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</div>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='max-w-96 truncate'>{row.original.legalName}</div>,
	},
	{
		accessorKey: 'commercialName',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Nombre comercial
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</div>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => <div className='max-w-96 truncate'>{row.original.commercialName || '---'}</div>,
	},
	{
		accessorKey: 'required',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Requerido
						{column.getIsSorted() === 'asc' ? (
							<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : column.getIsSorted() === 'desc' ? (
							<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
						) : null}
					</div>
				}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		cell: ({ row }) => (
			<div className='max-w-56 truncate'>
				<Badge
					variant={row.original.status === 'active' ? 'success' : 'warning'}
					text={row.original.status === 'acrive' ? 'Activo' : 'Inactivo'}
				/>
			</div>
		),
	},
	{
		accessorKey: 'date',
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
