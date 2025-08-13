'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { I_ReportItem } from '@/common/types/modules/report'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Typography } from '@/components/ui/typography'
import { formatDate } from '@/common/utils/dateFormater-util'

export const createTableColumns = (): ColumnDef<I_ReportItem>[] => [
	{
		accessorKey: 'date',
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
		cell: ({ row }) => <div>{formatDate(row.original.date)}</div>,
	},
    {
		accessorKey: 'totalSales',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Ventas Totales
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
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>${row.original.totalSales}</div>,
	},
    {
		accessorKey: 'numberOfSales',
		header: ({ column }) => (
			<ActionButton
				variant='link'
				size='xs'
				className='p-0'
				text={
					<Typography variant='overline' className='flex'>
						Número de Ventas
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
		cell: ({ row }) => <div className='line-clamp-3 max-w-fit break-words whitespace-normal'>{row.original.numberOfSales}</div>,
	},
]
