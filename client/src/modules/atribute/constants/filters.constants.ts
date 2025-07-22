import { Pagination, SortOption } from '@/modules/atribute/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Nombre (A-Z)', field: 'name', order: 'asc', key: 'name:asc' },
	{ label: 'Nombre (Z-A)', field: 'name', order: 'desc', key: 'name:desc' },
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
