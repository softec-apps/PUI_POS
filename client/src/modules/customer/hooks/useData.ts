import { useMemo } from 'react'
import { useCustomer, UseCustomerParamsProps } from '@/common/hooks/useCustomer'

export const useCustomerData = (params: UseCustomerParamsProps) => {
	const customerHook = useCustomer(params)

	const data = useMemo(() => {
		const items = customerHook.recordsData?.data?.items || []
		const pagination = customerHook.recordsData?.data?.pagination

		return {
			items,
			pagination,
			isEmpty: pagination?.totalRecords === 0,
			hasError: !!customerHook.error,
		}
	}, [customerHook.recordsData, customerHook.error])

	return {
		...customerHook,
		data,
	}
}
