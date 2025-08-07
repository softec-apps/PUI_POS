'use client'

import { Icons } from '@/components/icons'
import { ColumnDef } from '@tanstack/react-table'
import { I_Kardex } from '@/common/types/modules/kardex'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { MovementTypeBadge } from '@/modules/kardex/components/atoms/StatusBadge'
import { TableActions } from '@/modules/kardex/components/organisms/Table/TableActions'
import { TableInfoDate } from '@/modules/kardex/components/organisms/Table/TableInfoDate'

interface TableColumnsProps {
	showActions?: boolean
	sortableColumns?: string[] // Array de columnas que se pueden ordenar
	enableSorting?: boolean // Habilitar/deshabilitar sorting globalmente
	// Props para mostrar/ocultar columnas específicas
	showProductCode?: boolean
	showMovementType?: boolean
	showQuantity?: boolean
	showUnitCost?: boolean
	showSubtotal?: boolean
	showTaxRate?: boolean
	showTaxAmount?: boolean
	showTotal?: boolean
	showStockAfter?: boolean
	showStockBefore?: boolean
	showResponsible?: boolean
	showInfo?: boolean
}

export const tableColumns = ({
	showActions = true,
	sortableColumns,
	enableSorting = true,
	// Props de columnas con valores por defecto (todas visibles)
	showProductCode = true,
	showMovementType = true,
	showQuantity = true,
	showUnitCost = true,
	showSubtotal = true,
	showTaxRate = true,
	showTaxAmount = true,
	showTotal = true,
	showStockAfter = true,
	showStockBefore = true,
	showResponsible = true,
	showInfo = true,
}: TableColumnsProps): ColumnDef<I_Kardex>[] => {
	// Función helper para verificar si una columna es sortable
	const isColumnSortable = (columnKey: string): boolean => {
		if (!enableSorting) return false
		if (!sortableColumns) return true // Si no se especifica, todas son sortables por defecto
		return sortableColumns.includes(columnKey)
	}

	// Función helper para crear header sortable o normal
	const createHeader = (columnKey: string, label: string, column: any) => {
		if (!isColumnSortable(columnKey)) {
			return <div className='text-muted-foreground'>{label}</div>
		}

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

	const columns: ColumnDef<I_Kardex>[] = []

	// Columna: Código de Producto
	if (showProductCode) {
		columns.push({
			accessorKey: 'product.code',
			header: ({ column }) => createHeader('product.code', 'Cód. Producto', column),
			enableSorting: isColumnSortable('product.code'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					{row.original.product.code}
				</div>
			),
		})
	}

	// Columna: Tipo de Movimiento
	if (showMovementType) {
		columns.push({
			accessorKey: 'movementType',
			header: ({ column }) => createHeader('movementType', 'Tipo movimiento', column),
			enableSorting: isColumnSortable('movementType'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					<MovementTypeBadge movementType={row.original.movementType} />
				</div>
			),
		})
	}

	// Columna: Cantidad
	if (showQuantity) {
		columns.push({
			accessorKey: 'quantity',
			header: ({ column }) => createHeader('quantity', 'Unid.', column),
			enableSorting: isColumnSortable('quantity'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					{row.original.quantity || '0'}
				</div>
			),
		})
	}

	// Columna: Stock Anterior (opcional)
	if (showStockBefore) {
		columns.push({
			accessorKey: 'stockBefore',
			header: ({ column }) => createHeader('stockBefore', 'Stock Ant.', column),
			enableSorting: isColumnSortable('stockBefore'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					{row.original.stockBefore}
				</div>
			),
		})
	}

	// Columna: Stock Actual
	if (showStockAfter) {
		columns.push({
			accessorKey: 'stockAfter',
			header: ({ column }) => createHeader('stockAfter', 'Stock Act.', column),
			enableSorting: isColumnSortable('stockAfter'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					{row.original.stockAfter}
				</div>
			),
		})
	}

	// Columna: Costo Unitario
	if (showUnitCost) {
		columns.push({
			accessorKey: 'unitCost',
			header: ({ column }) => createHeader('unitCost', 'Costo unt.', column),
			enableSorting: isColumnSortable('unitCost'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					${formatPrice(row.original.unitCost)} USD
				</div>
			),
		})
	}

	// Columna: Subtotal
	if (showSubtotal) {
		columns.push({
			accessorKey: 'subtotal',
			header: ({ column }) => createHeader('subtotal', 'Subtotal', column),
			enableSorting: isColumnSortable('subtotal'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					${formatPrice(row.original.subtotal)}
				</div>
			),
		})
	}

	// Columna: Tasa de Impuesto
	if (showTaxRate) {
		columns.push({
			accessorKey: 'taxRate',
			header: ({ column }) => createHeader('taxRate', 'Tasa Imp.', column),
			enableSorting: isColumnSortable('taxRate'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					{row.original.taxRate}%
				</div>
			),
		})
	}

	// Columna: Monto de Impuesto
	if (showTaxAmount) {
		columns.push({
			accessorKey: 'taxAmount',
			header: ({ column }) => createHeader('taxAmount', 'Monto Imp.', column),
			enableSorting: isColumnSortable('taxAmount'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					${formatPrice(row.original.taxAmount)} USD
				</div>
			),
		})
	}

	// Columna: Total
	if (showTotal) {
		columns.push({
			accessorKey: 'total',
			header: ({ column }) => createHeader('total', 'Total', column),
			enableSorting: isColumnSortable('total'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					${formatPrice(row.original.total)} USD
				</div>
			),
		})
	}

	// Columna: Responsable
	if (showResponsible) {
		columns.push({
			accessorKey: 'user.id',
			header: ({ column }) => createHeader('user.id', 'Responsable', column),
			enableSorting: isColumnSortable('user.id'),
			cell: ({ row }) => (
				<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
					{row.original.user.firstName} {row.original.user.lastName}
				</div>
			),
		})
	}

	// Columna: Información
	if (showInfo) {
		columns.push({
			accessorKey: 'date',
			header: 'Información',
			enableSorting: false, // Esta columna nunca es sortable
			cell: ({ row }) => <TableInfoDate recordData={row.original} />,
		})
	}

	// Columna: Acciones
	if (showActions) {
		columns.push({
			id: 'actions',
			enableSorting: false,
			cell: ({ row }) => (
				<div className='flex justify-end'>
					<TableActions recordData={row.original} />
				</div>
			),
		})
	}

	return columns
}
