import { Pagination } from '@/common/types/pagination'

export const DEFAULT_PAGINATION: Pagination = {
	page: 1,
	limit: 10,
	filters: {},
	sort: [],
	search: '',
}
