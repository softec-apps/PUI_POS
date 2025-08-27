'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { I_Category } from '@/common/types/modules/category'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { InfoDate } from '@/modules/category/components/atoms/InfoDate'
import { Actions } from '@/modules/category/components/organisms/Actions'
import { StatusBadge } from '@/modules/category/components/atoms/StatusBadge'

interface createTableColumnsProps {
	onEdit: (recordData: I_Category) => void
	onSoftDelete: (recordData: I_Category) => void
	onHardDelete: (recordData: I_Category) => void
	onRestore: (recordData: I_Category) => void
}

export const createTableColumns = ({
	onEdit,
	onSoftDelete,
	onHardDelete,
	onRestore,
}: createTableColumnsProps): ColumnDef<I_Category>[] => [
	{
		accessorKey: 'photo',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<div className='text-muted-foreground hover:text-primary/95 flex items-center'>
						Imagen
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
				<ImageControl
					recordData={row.original.photo}
					enableHover={false}
					enableClick={false}
					imageHeight={50}
					imageWidth={50}
				/>
			</div>
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
		cell: ({ row }) => <div className='max-w-96 truncate'>{row.original.name}</div>,
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
		cell: ({ row }) => <div className='max-w-96 truncate'>{row.original.description || '-'}</div>,
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
			<div className='max-w-56 truncate'>
				<StatusBadge status={row.original.status} />
			</div>
		),
	},
	{
		accessorKey: 'date',
		header: 'Información',
		cell: ({ row }) => <InfoDate recordData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='flex justify-end'>
				<Actions
					recordData={row.original}
					onEdit={onEdit}
					onSoftDelete={onSoftDelete}
					onHardDelete={onHardDelete}
					onRestore={onRestore}
				/>
			</div>
		),
	},
]
