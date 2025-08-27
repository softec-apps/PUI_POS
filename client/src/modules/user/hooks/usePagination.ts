import { Pagination } from '@/common/types/pagination'
import { useState, useCallback, useRef, useEffect } from 'react'
import { DEFAULT_PAGINATION } from '@/common/constants/pagination-const'
import { DateFilters, DateRange, DateFilterType } from '@/common/types/pagination'

interface FilterState {
	searchTerm: string
	currentSort: string
	currentStatus: 1 | 2 | null
	dateFilters: DateFilters
}

const INITIAL_FILTER_STATE: FilterState = {
	searchTerm: '',
	currentSort: '',
	currentStatus: null,
	dateFilters: {},
}

const DEBOUNCE_DELAY = 500

export function usePagination() {
	const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
	const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE)
	const debounceTimer = useRef<NodeJS.Timeout | null>(null)

	// Generic pagination handlers
	const updatePagination = useCallback((updates: Partial<Pagination>) => {
		setPagination(prev => ({ ...prev, ...updates }))
	}, [])

	const resetToFirstPage = useCallback(
		(updates: Partial<Pagination> = {}) => {
			updatePagination({ ...updates, page: 1 })
		},
		[updatePagination]
	)

	// Page navigation (same as before)
	const handlePageChange = useCallback(
		(page: number) => {
			updatePagination({ page })
		},
		[updatePagination]
	)

	const handleNextPage = useCallback(
		(hasNextPage: boolean) => {
			if (hasNextPage) {
				updatePagination({ page: pagination.page + 1 })
			}
		},
		[updatePagination, pagination.page]
	)

	const handlePrevPage = useCallback(() => {
		if (pagination.page > 1) {
			updatePagination({ page: pagination.page - 1 })
		}
	}, [updatePagination, pagination.page])

	const handleLimitChange = useCallback(
		(value: string) => {
			resetToFirstPage({ limit: Number(value) })
		},
		[resetToFirstPage]
	)

	// Search handling (same as before)
	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFilters(prev => ({ ...prev, searchTerm: value }))
	}, [])

	// ✨ Date filter handling
	const handleDateFilterChange = useCallback(
		(filterType: DateFilterType, dateRange: DateRange) => {
			setFilters(prev => ({
				...prev,
				dateFilters: {
					...prev.dateFilters,
					[filterType]: dateRange,
				},
			}))

			// Update pagination filters
			const newDateFilters = {
				...filters.dateFilters,
				[filterType]: dateRange,
			}

			// Remove empty date filters
			const cleanedDateFilters = Object.fromEntries(
				Object.entries(newDateFilters).filter(([_, range]) => range && (range.startDate || range.endDate))
			)

			resetToFirstPage({
				filters: {
					status: filters.currentStatus || undefined,
					...cleanedDateFilters,
				},
			})
		},
		[filters, resetToFirstPage]
	)

	const clearDateFilter = useCallback(
		(filterType: DateFilterType) => {
			setFilters(prev => {
				const newDateFilters = { ...prev.dateFilters }
				delete newDateFilters[filterType]
				return {
					...prev,
					dateFilters: newDateFilters,
				}
			})

			const newDateFilters = { ...filters.dateFilters }
			delete newDateFilters[filterType]

			const cleanedDateFilters = Object.fromEntries(
				Object.entries(newDateFilters).filter(([_, range]) => range && (range.startDate || range.endDate))
			)

			resetToFirstPage({
				filters: {
					status: filters.currentStatus || undefined,
					...cleanedDateFilters,
				},
			})
		},
		[filters, resetToFirstPage]
	)

	const updatePaginationSearch = useCallback(
		(searchValue: string) => {
			resetToFirstPage({ search: searchValue })
		},
		[resetToFirstPage]
	)

	// Debounced search effect
	useEffect(() => {
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current)
		}

		debounceTimer.current = setTimeout(() => {
			updatePaginationSearch(filters.searchTerm)
		}, DEBOUNCE_DELAY)

		return () => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current)
			}
		}
	}, [filters.searchTerm, updatePaginationSearch])

	// Sort handling (same as before)
	const handleSort = useCallback(
		(sortKey: string) => {
			setFilters(prev => ({ ...prev, currentSort: sortKey }))

			if (!sortKey) {
				resetToFirstPage({ sort: [] })
				return
			}

			const [field, order] = sortKey.split(':')
			resetToFirstPage({
				sort: [{ orderBy: field, order: order as 'asc' | 'desc' }],
			})
		},
		[resetToFirstPage]
	)

	// Status filtering (updated to include date filters)
	const handleStatusChange = useCallback(
		(status: 1 | 2 | null) => {
			setFilters(prev => ({ ...prev, currentStatus: status }))

			const cleanedDateFilters = Object.fromEntries(
				Object.entries(filters.dateFilters).filter(([_, range]) => range && (range.startDate || range.endDate))
			)

			resetToFirstPage({
				filters: {
					status: status || undefined,
					...cleanedDateFilters,
				},
			})
		},
		[filters.dateFilters, resetToFirstPage]
	)

	// Reset all filters (updated)
	const handleResetAll = useCallback(() => {
		setFilters(INITIAL_FILTER_STATE)
		setPagination(DEFAULT_PAGINATION)
	}, [])

	// Utility functions
	const getCurrentSortInfo = useCallback(() => {
		if (!filters.currentSort) return null
		const [field, order] = filters.currentSort.split(':')
		return { field, order }
	}, [filters.currentSort])

	const hasActiveFilters = useCallback(() => {
		const hasDateFilters = Object.values(filters.dateFilters).some(range => range && (range.startDate || range.endDate))
		return !!(filters.searchTerm || filters.currentSort || filters.currentStatus || hasDateFilters)
	}, [filters])

	const getActiveDateFilters = useCallback(() => {
		return Object.fromEntries(
			Object.entries(filters.dateFilters).filter(([_, range]) => range && (range.startDate || range.endDate))
		)
	}, [filters.dateFilters])

	return {
		// State
		pagination,
		...filters,

		// Pagination handlers
		handlePageChange,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,

		// Filter handlers
		handleSearchChange,
		handleSort,
		handleStatusChange,
		handleDateFilterChange,
		clearDateFilter,
		handleResetAll,

		// Utilities
		getCurrentSortInfo,
		hasActiveFilters,
		getActiveDateFilters,
		setPagination,
	}
}
