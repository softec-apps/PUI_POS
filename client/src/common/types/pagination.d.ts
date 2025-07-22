export interface Pagination {
	page: number
	limit: number
	search?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	filters: Record<string, any>
	sort: Array<{ orderBy: string; order: 'asc' | 'desc' | '' }>
}

export interface SortOption {
	key: string
	label: string
	field: string
	order: 'asc' | 'desc'
}

export interface I_MetaPagination {
	totalRecords: number
	totalCount: number
	currentPage: number
	totalPages: number
	pageSize: number
	hasNextPage: boolean
	hasPreviousPage: boolean
	firstPage: number
	lastPage: number
}

export interface I_MetaResponse {
	timestamp: string | date
	resource: string
	method: string
}
