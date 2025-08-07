'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Brand } from '@/common/types/modules/brand'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

import { TableActions } from '@/modules/brand/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/brand/components/organisms/Table/TableInfoDate'

interface TableColumnsProps {
	onEdit: (brandData: I_Brand) => void
	onHardDelete: (brandData: I_Brand) => void
}

export const createTableColumns = ({ onEdit, onHardDelete }: TableColumnsProps): ColumnDef<I_Brand>[] => [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Nombre
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
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.name}
			</div>
		),
	},
	{
		accessorKey: 'description',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Descripción
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
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				{row.original.description || 'Sin descripción'}
			</div>
		),
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Estado
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
			<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
				<Badge
					variant={row.original.status === 'active' ? 'success' : 'warning'}
					text={row.original.status === 'active' ? 'Activo' : 'Inactivo'}
				/>
			</div>
		),
	},
	{
		accessorKey: 'date',
		header: 'Información',
		cell: ({ row }) => <TableInfoDate brandData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<TableActions brandData={row.original} onEdit={onEdit} onHardDelete={onHardDelete} />
			</div>
		),
	},
]
