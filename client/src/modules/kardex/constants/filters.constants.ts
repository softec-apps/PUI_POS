import { Pagination, SortOption } from '@/modules/kardex/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Fecha reciente', field: 'createdAt', order: 'desc', key: 'createdAt:desc' },
	{ label: 'Fecha antigua', field: 'createdAt', order: 'asc', key: 'createdAt:asc' },

	{ label: 'Cantidad (mayor a menor)', field: 'quantity', order: 'desc', key: 'quantity:desc' },
	{ label: 'Cantidad (menor a mayor)', field: 'quantity', order: 'asc', key: 'quantity:asc' },

	{ label: 'Total (mayor a menor)', field: 'total', order: 'desc', key: 'total:desc' },
	{ label: 'Total (menor a mayor)', field: 'total', order: 'asc', key: 'total:asc' },
]

export const INITIAL_PAGINATION: Pagination = {
	page: 1,
	limit: 10,
	filters: {},
	sort: [],
	search: '',
}

export const KARDEX_TYPE_OPTIONS = [
	{ label: 'Todos', value: '' },
	{ label: 'Compra', value: 'purchase' },
	{ label: 'Devolución de cliente', value: 'return_in' },
	{ label: 'Transferencia entrante', value: 'transfer_in' },
	{ label: 'Venta', value: 'sale' },
	{ label: 'Devolución a proveedor', value: 'return_out' },
	{ label: 'Transferencia saliente', value: 'transfer_out' },
	{ label: 'Ajuste positivo', value: 'adjustment_in' },
	{ label: 'Ajuste negativo', value: 'adjustment_out' },
	{ label: 'Dañado', value: 'damaged' },
	{ label: 'Vencido', value: 'expired' },
]
