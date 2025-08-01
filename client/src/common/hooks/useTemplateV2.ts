import { useMemo } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { TEMPLATE_ENDPOINTS_CONFIG } from '@/common/configs/api/template-endpoints.config'
import { I_TemplateResponse, I_CreateTemplate, I_UpdateTemplate, I_Template } from '@/modules/template/types/template'

interface UseTemplateParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: I_Template; order: 'asc' | 'desc' }>
}

export const useTemplateV2 = (paginationParams: UseTemplateParams = {}) => {
	const api = useGenericApi<I_TemplateResponse, I_CreateTemplate, I_UpdateTemplate>(TEMPLATE_ENDPOINTS_CONFIG)

	const queryParams = useMemo(() => {
		const params: Record<string, any> = {}

		if (paginationParams.page !== undefined) params.page = paginationParams.page
		if (paginationParams.limit !== undefined) params.limit = paginationParams.limit

		if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0) {
			const cleanFilters = Object.entries(paginationParams.filters).reduce(
				(acc, [key, value]) => {
					if (value !== undefined && value !== null && value !== '') {
						acc[key] = value
					}
					return acc
				},
				{} as Record<string, string>
			)

			if (Object.keys(cleanFilters).length > 0) {
				params.filters = JSON.stringify(cleanFilters)
			}
		}

		if (paginationParams.sort && paginationParams.sort.length > 0) params.sort = JSON.stringify(paginationParams.sort)
		if (paginationParams.search && paginationParams.search.trim()) params.search = paginationParams.search.trim()

		return params
	}, [
		paginationParams.page,
		paginationParams.limit,
		paginationParams.filters,
		paginationParams.sort,
		paginationParams.search,
	])

	const query = api.buildQuery(queryParams)

	return {
		template: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		refetchTemplate: query.refetch,

		createTemplate: api.create,
		updateTemplate: api.update,
		hardDeleteTemplate: api.hardDelete,

		isCreating: api.isCreating,
		isUpdating: api.isUpdating,
		isHardDeleting: api.isHardDeleting,

		mutations: api.mutations,
		executeCustomEndpoint: api.executeCustomEndpoint,
		apiService: api.apiService,
	}
}
