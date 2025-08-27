import { useMemo } from 'react'
import { useUser, UseUserParamsProps } from '@/common/hooks/useUser'

export const useUserData = (params: UseUserParamsProps) => {
	const userHook = useUser(params)

	const data = useMemo(() => {
		const items = userHook.recordsData?.data?.items || []
		const pagination = userHook.recordsData?.data?.pagination

		const stats = {
			totalRecords: items.length,
			activeRecords: 0,
			inactiveRecords: 0,
			deletedRecords: 0,
		}

		items.forEach(item => {
			switch (true) {
				case item.status.name === 'Active':
					stats.activeRecords++
					break
				case item.status.name === 'Inactive':
					stats.inactiveRecords++
					break
			}
			if (item.deletedAt !== null) stats.deletedRecords++
		})

		return {
			items,
			pagination,
			isEmpty: pagination?.totalRecords === 0,
			hasError: !!userHook.error,
			generalStats: stats,
		}
	}, [userHook.recordsData, userHook.error])

	return {
		...userHook,
		data,
	}
}
