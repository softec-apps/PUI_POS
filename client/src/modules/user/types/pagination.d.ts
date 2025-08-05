export interface Pagination {
	page: number
	limit: number
	search?: string
	filters: Record<string, string>
	sort: Array<{ orderBy: string; order: 'asc' | 'desc' | '' }>
}

export interface SortOption {
	key: string
	label: string
	field: string
	order: 'asc' | 'desc'
}
