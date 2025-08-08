import { Pagination } from '@/common/types/pagination'
import { useState, useCallback, useRef, useEffect } from 'react'
import { DEFAULT_PAGINATION } from '@/common/constants/pagination-const'

export function usePagination() {
	const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
	const [searchTerm, setSearchTerm] = useState<string>('')
	const debounceTimer = useRef<NodeJS.Timeout | null>(null)
	const [currentSort, setCurrentSort] = useState<string>('')
	const [currentStatus, setCurrentStatus] = useState<
		'active' | 'inactive' | ''
	>('')

	// 🆕 Nueva función para cambio directo de página
	const handlePageChange = useCallback((page: number) => {
		setPagination(prev => ({
			...prev,
			page: page,
		}))
	}, [])

	const handleNextPage = useCallback((hasNextPage: boolean) => {
		if (hasNextPage) setPagination(prev => ({ ...prev, page: prev.page + 1 }))
	}, [])

	const handlePrevPage = useCallback(() => {
		setPagination(prev => ({
			...prev,
			page: prev.page > 1 ? prev.page - 1 : prev.page,
		}))
	}, [])

	const handleLimitChange = useCallback((value: string) => {
		setPagination(prev => ({ ...prev, limit: Number(value), page: 1 }))
	}, [])

	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		if (typeof value === 'string') {
			setSearchTerm(value)
		} else {
			console.warn('⚠️ Non-string value received in search:', value)
			setSearchTerm('')
		}
	}, [])

	const updatePaginationSearch = useCallback((searchValue: string) => {
		const safeSearchValue = typeof searchValue === 'string' ? searchValue : ''
		setPagination(prev => ({
			...prev,
			search: safeSearchValue,
			page: 1,
		}))
	}, [])

	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current)
		debounceTimer.current = setTimeout(() => updatePaginationSearch(searchTerm), 500)

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current)
		}
	}, [searchTerm, updatePaginationSearch])

	// 🔧 FUNCIÓN COMPLETAMENTE CORREGIDA: handleSort
	const handleSort = useCallback((sortKey: string) => {
		if (!sortKey) {
			setCurrentSort('')
			setPagination(prev => ({
				...prev,
				sort: [],
				page: 1,
			}))
			return
		}

		const [field, order] = sortKey.split(':')
		setCurrentSort(sortKey)
		setPagination(prev => ({
			...prev,
			sort: [{ orderBy: field, order: order as 'asc' | 'desc' }],
			page: 1,
		}))
	}, [])

	const handleStatusChange = useCallback(
		(status: 'active' | 'inactive' | '') => {
			setCurrentStatus(status)
			setPagination(prev => ({
				...prev,
				filters: status ? { status } : {},
				page: 1,
			}))
		},
		[]
	)

	const handleResetAll = useCallback(() => {
		setSearchTerm('')
		setCurrentSort('')
		setCurrentStatus('')
		setPagination(DEFAULT_PAGINATION)
	}, [])

	const getCurrentSortInfo = useCallback(() => {
		if (!currentSort) return null
		const [field, order] = currentSort.split(':')
		return { field, order }
	}, [currentSort])

	return {
		pagination,
		searchTerm,
		currentSort,
		currentStatus,
		setPagination,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleStatusChange,
		handleSearchChange,
		handleSort,
		handlePageChange,
		handleResetAll,
		getCurrentSortInfo,
	}
}
