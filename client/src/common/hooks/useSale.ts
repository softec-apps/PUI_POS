import { useGenericApi } from '@/common/hooks/useGenericApi'
import { SALE_ENDPOINTS_CONFIG } from '@/common/configs/api/sale-endpoints.config'
import { I_CreateSale, I_Sale, I_UpdateSale, I_SalesResponse } from '@/common/types/modules/sale'

interface UseSaleParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Sale; order: 'asc' | 'desc' }>
}

export const useSale = (paginationParams: UseSaleParams = {}) => {
	const api = useGenericApi<I_SalesResponse, I_CreateSale, I_UpdateSale>(SALE_ENDPOINTS_CONFIG)

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
				orderBy: field as keyof I_Sale,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	const query = api.buildQuery(queryParams)

	return {
		sales: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		refetchSales: query.refetch,

		createSale: api.create,
		updateSale: api.update,
		hardDeleteSale: api.hardDelete,

		isCreating: api.isCreating,
		isUpdating: api.isUpdating,
		isHardDeleting: api.isHardDeleting,

		mutations: api.mutations,

		executeCustomEndpoint: api.executeCustomEndpoint,
		apiService: api.apiService,
	}
}
