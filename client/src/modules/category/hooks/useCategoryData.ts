import { useMemo } from 'react'
import { useCategory, UseCategoryParams } from '@/common/hooks/useCategory'

export const useCategoryData = (params: UseCategoryParams) => {
	const categoryHook = useCategory(params)

	const data = useMemo(() => {
		const items = categoryHook.recordsData?.data?.items || []
		const pagination = categoryHook.recordsData?.data?.pagination

		const stats = {
			totalRecords: items.length,
			activeRecords: 0,
			inactiveRecords: 0,
			deletedRecords: 0,
		}

		items.forEach(item => {
			switch (true) {
				case item.status === 'active':
					stats.activeRecords++
					break
				case item.status === 'inactive':
					stats.inactiveRecords++
					break
			}
			if (item.deletedAt !== null) stats.deletedRecords++
		})

		return {
			items,
			pagination,
			isEmpty: pagination?.totalRecords === 0,
			hasError: !!categoryHook.error,
			generalStats: stats,
		}
	}, [categoryHook.recordsData, categoryHook.error])

	return {
		...categoryHook,
		data,
	}
}
