import api from '@/lib/axios'
import { useCallback } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { CUSTOMER_ENDPOINTS_CONFIG } from '@/common/configs/api/customer-endpoints.config'
import {
	I_CreateCustomer,
	I_Customer,
	I_UpdateCustomer,
	I_CustomerResponse,
	I_CustomerId,
} from '@/common/types/modules/customer'

interface UseCustomerParamsProps {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Customer; order: 'asc' | 'desc' }>
}

export const useCustomer = (paginationParams: UseCustomerParamsProps = {}) => {
	const genericApi = useGenericApi<I_CustomerResponse, I_CreateCustomer, I_UpdateCustomer>(CUSTOMER_ENDPOINTS_CONFIG)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const queryParams: Record<string, any> = {}

	if (paginationParams.page !== undefined) queryParams.page = paginationParams.page
	if (paginationParams.limit !== undefined) queryParams.limit = paginationParams.limit

	if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0)
		queryParams.filters = JSON.stringify(paginationParams.filters)

	if (paginationParams.sort && paginationParams.sort.length > 0) {
		const sortObjects = (paginationParams.sort as unknown as string[]).map(sortString => {
			const [field, order] = sortString.split(':')
			return {
				orderBy: field as keyof I_Customer,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	const query = genericApi.buildQuery(queryParams)

	const getCustomerById = useCallback(async (id: I_CustomerId) => {
		try {
			const response = await api.get(`${ENDPOINT_API.CUSTOMER}/${id}`)
			return response.data.data
		} catch (error) {
			throw error
		}
	}, [])

	return {
		recordsData: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		refetchRecords: query.refetch,

		getCustomerById: getCustomerById,
		createRecord: genericApi.create,
		updateRecord: genericApi.update,
		hardDeleteRecord: genericApi.hardDelete,

		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,
		isHardDeleting: genericApi.isHardDeleting,

		mutations: genericApi.mutations,

		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
