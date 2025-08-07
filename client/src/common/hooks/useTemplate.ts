import { useMemo } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { TEMPLATE_ENDPOINTS_CONFIG } from '@/common/configs/api/template-endpoints.config'
import { I_TemplateResponse, I_CreateTemplate, I_UpdateTemplate, I_Template } from '@/common/types/modules/template'

interface UseTemplateParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: I_Template; order: 'asc' | 'desc' }>
}

export const useTemplate = (paginationParams: UseTemplateParams = {}) => {
	const api = useGenericApi<I_TemplateResponse, I_CreateTemplate, I_UpdateTemplate>(TEMPLATE_ENDPOINTS_CONFIG)

	// ✅ Memoizar queryParams para evitar recreaciones innecesarias
	const queryParams = useMemo(() => {
		const params: Record<string, any> = {}

		// Solo agregar parámetros si tienen valores válidos
		if (paginationParams.page !== undefined) params.page = paginationParams.page

		if (paginationParams.limit !== undefined) params.limit = paginationParams.limit

		// ✅ Solo serializar filters si existen y no están vacíos
		if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0) {
			// Filtrar valores vacíos o undefined
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

		// ✅ Solo serializar sort si existe y no está vacío
		if (paginationParams.sort && paginationParams.sort.length > 0) params.sort = JSON.stringify(paginationParams.sort)

		// ✅ Solo agregar search si no está vacío
		if (paginationParams.search && paginationParams.search.trim()) params.search = paginationParams.search.trim()

		return params
	}, [
		paginationParams.page,
		paginationParams.limit,
		paginationParams.filters,
		paginationParams.sort,
		paginationParams.search,
	])

	// ✅ Usar el query dinámico con los parámetros de paginación memoizados
	const query = api.buildQuery(queryParams)

	// ✅ Retornar objeto estable
	return {
		// Datos del query
		template: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones
		refetchTemplate: query.refetch,

		// Funciones CRUD
		createTemplate: api.create,
		updateTemplate: api.update,
		hardDeleteTemplate: api.hardDelete,

		// Estados granulares de loading
		isCreating: api.isCreating,
		isUpdating: api.isUpdating,
		isHardDeleting: api.isHardDeleting,

		// Mutations para control avanzado
		mutations: api.mutations,

		// Funciones adicionales del API genérico
		executeCustomEndpoint: api.executeCustomEndpoint,
		apiService: api.apiService,
	}
}
