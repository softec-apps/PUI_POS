export interface Pagination {
	page: number
	limit: number
	filters: Record<string, string>
	sort: Array<{ orderBy: string; order: 'asc' | 'desc' | '' }>
	search?: string
}

export interface SortOption {
	label: string
	field: string
	order: 'asc' | 'desc'
	key: string
}
