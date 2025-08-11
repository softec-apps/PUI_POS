import { Pagination, SortOption } from '@/modules/atribute/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Nombre (A-Z)', field: 'name', order: 'asc', key: 'name:asc' },
	{ label: 'Nombre (Z-A)', field: 'name', order: 'desc', key: 'name:desc' },

	{ label: 'Descripción (A-Z)', field: 'description', order: 'asc', key: 'description:asc' },
	{ label: 'Descripción (Z-A)', field: 'description', order: 'desc', key: 'description:desc' },

	{ label: 'Código (A-Z)', field: 'code', order: 'asc', key: 'code:asc' },
	{ label: 'Código (Z-A)', field: 'code', order: 'desc', key: 'code:desc' },

	{ label: 'Fecha reciente', field: 'createdAt', order: 'desc', key: 'createdAt:desc' },
	{ label: 'Fecha antigua', field: 'createdAt', order: 'asc', key: 'createdAt:asc' },
]

export const INITIAL_PAGINATION: Pagination = {
	page: 1,
	limit: 10,
	filters: {},
	sort: [],
	search: '',
}

export const STATUS_ALLOW = {
	DRAFT: 'draft',
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DISCONTINUED: 'discontinued',
	OUT_OF_STOCK: 'out_of_stock',
}

export const STATUS_OPTIONS = [
	{ label: 'Borrador', value: STATUS_ALLOW.DRAFT },
	{ label: 'Activo', value: STATUS_ALLOW.ACTIVE },
	{ label: 'Inactivo', value: STATUS_ALLOW.INACTIVE },
	{ label: 'Descontinuado', value: STATUS_ALLOW.DISCONTINUED },
	{ label: 'Agotado', value: STATUS_ALLOW.OUT_OF_STOCK },
]

export type StatusAllow = (typeof STATUS_ALLOW)[keyof typeof STATUS_ALLOW]
