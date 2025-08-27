import { useMemo } from 'react'
import { useSupplier, useSupplierProps } from '@/common/hooks/useSupplier'

export const useSupplierData = (params: useSupplierProps) => {
	const supplierHook = useSupplier(params)

	const data = useMemo(() => {
		const items = supplierHook.recordsData?.data?.items || []
		const pagination = supplierHook.recordsData?.data?.pagination

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
			hasError: !!supplierHook.error,
			generalStats: stats,
		}
	}, [supplierHook.recordsData, supplierHook.error])

	return {
		...supplierHook,
		data,
	}
}
