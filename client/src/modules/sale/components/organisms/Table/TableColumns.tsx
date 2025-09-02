'use client'

import { Icons } from '@/components/icons'
import { Column, ColumnDef } from '@tanstack/react-table'
import { I_Sale } from '@/common/types/modules/sale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Actions } from '@/modules/sale/components/organisms/Actions'
import { InfoDate } from '@/modules/sale/components/atoms/InfoDate'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { MethodPaymentBadge } from '@/modules/sale/components/atoms/MethodPaymentBadge'
import { Badge } from '@/components/layout/atoms/Badge'

const createHeader = (column: Column<I_Sale>, label: string) => {
	return (
		<ActionButton
			variant='link'
			size='xs'
			className='p-0'
			text={
				<span className='text-muted-foreground hover:text-primary/95 flex items-center'>
					{label}
					{column.getIsSorted() === 'asc' ? (
						<Icons.sortAscendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
					) : column.getIsSorted() === 'desc' ? (
						<Icons.sortDescendingLetters className='ml-1 h-4 w-4 transition-all duration-500' />
					) : null}
				</span>
			}
			onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
		/>
	)
}

export const createTableColumns = (): ColumnDef<I_Sale>[] => [
	{
		accessorKey: 'clave_acceso',
		header: ({ column }) => createHeader(column, 'Clave acceso (SRI)'),
		cell: ({ row }) => {
			const clave = row.original?.clave_acceso || '-'
			if (clave === '-') return <span>-</span>

			const start = clave?.slice(0, 8) // primeros 8 caracteres
			const end = clave?.slice(-8) // últimos 8 caracteres

			return <span>{`${start}........${end}`}</span>
		},
	},
	{
		accessorKey: 'estado_sri',
		header: ({ column }) => createHeader(column, 'Estado (SRI)'),
		cell: ({ row }) => {
			// Mostrar solo si hay clave_acceso
			if (!row.original?.clave_acceso) return '-'

			const estado = row.original.estado_sri

			let variant: 'default' | 'destructive' | 'warning' | 'success' = 'default'
			if (estado === 'AUTHORIZED') variant = 'success'
			else if (estado === 'PENDING') variant = 'warning'

			return (
				<Badge
					variant={variant}
					text={estado === 'AUTHORIZED' ? 'Autorizado' : estado === 'PENDING' ? 'Pendiente' : estado || '-'}
				/>
			)
		},
	},
	{
		accessorKey: 'code',
		header: ({ column }) => createHeader(column, 'Código interno'),
		cell: ({ row }) => <span>{row.original.code}</span>,
	},
	{
		accessorKey: 'customer.firstName',
		header: ({ column }) => createHeader(column, 'Cliente'),
		cell: ({ row }) => (
			<span>
				{row.original?.customer?.firstName} {row.original?.customer?.lastName?.charAt(0)}
			</span>
		),
	},
	{
		accessorKey: 'paymentMethod',
		header: ({ column }) => createHeader(column, 'Método'),
		cell: ({ row }) => <MethodPaymentBadge type={row.original.paymentMethod} />,
	},
	{
		accessorKey: 'subtotal',
		header: ({ column }) => createHeader(column, 'Subtotal'),
		cell: ({ row }) => <span>${formatPrice(row.original?.subtotal)}</span>,
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
		header: () => <span className='text-muted-foreground'>Información</span>,
		cell: ({ row }) => <InfoDate recordData={row.original} />,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<span className='flex justify-end'>
				<Actions recordData={row.original} />
			</span>
		),
	},
]
