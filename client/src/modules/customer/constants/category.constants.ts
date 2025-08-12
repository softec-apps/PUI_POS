import { Pagination, SortOption } from '@/modules/customer/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Email (A-Z)', field: 'email', order: 'asc', key: 'email:asc' },
	{ label: 'Email (Z-A)', field: 'email', order: 'desc', key: 'email:desc' },

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
