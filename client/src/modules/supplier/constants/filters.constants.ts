import { Pagination, SortOption } from '@/modules/atribute/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Ruc (A-Z)', field: 'ruc', order: 'asc', key: 'ruc:asc' },
	{ label: 'Ruc (Z-A)', field: 'ruc', order: 'desc', key: 'ruc:desc' },

	{ label: 'LegalName (A-Z)', field: 'legalName', order: 'asc', key: 'legalName:asc' },
	{ label: 'LegalName (Z-A)', field: 'legalName', order: 'desc', key: 'legalName:desc' },

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
