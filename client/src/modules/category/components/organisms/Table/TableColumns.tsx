'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/layout/atoms/Badge'
import { I_Category } from '@/common/types/modules/category'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { TableActions } from '@/modules/category/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/category/components/organisms/Table/TableInfoDate'
import { Typography } from '@/components/ui/typography'

interface TableColumnsProps {
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
}

export const createTableColumns = ({ onEdit, onHardDelete }: TableColumnsProps): ColumnDef<I_Category>[] => [
	{
		accessorKey: 'photo',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Imagen
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
			<ImageControl
				imageUrl={row.original.photo?.path}
				enableHover={false}
				enableClick={false}
				imageHeight={60}
				imageWidth={60}
			/>
		),
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Nombre
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
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.name}</div>,
	},
	{
		accessorKey: 'description',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Descripción
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
					variant={row.original.status === 'active' ? 'success' : 'warning'}
					text={row.original.status === 'active' ? 'Activo' : 'Inactivo'}
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
		cell: ({ row }) => <TableInfoDate recordData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<TableActions categoryData={row.original} onEdit={onEdit} onHardDelete={onHardDelete} />
			</div>
		),
	},
]
