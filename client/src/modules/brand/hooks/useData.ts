import { useMemo } from 'react'
import { useBrand, UseBrandParams } from '@/common/hooks/useBrand'

export const useBrandData = (params: UseBrandParams) => {
	const brandHook = useBrand(params)

	const data = useMemo(() => {
		const items = brandHook.recordsData?.data?.items || []
		const pagination = brandHook.recordsData?.data?.pagination

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
			hasError: !!brandHook.error,
			generalStats: stats,
		}
	}, [brandHook.recordsData, brandHook.error])

	return {
		...brandHook,
		data,
	}
}
