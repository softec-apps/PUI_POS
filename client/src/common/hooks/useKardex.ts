import { useCallback } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { I_Kardex, I_KardexResponse, I_KardexId } from '@/modules/kardex/types/kardex'
import { KARDEX_ENDPOINTS_CONFIG } from '@/common/configs/api/kardex-endpoints.config'

interface UseKardexParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: I_Kardex; order: 'asc' | 'desc' }>
}

export const useKardex = (paginationParams: UseKardexParams = {}) => {
	const genericApi = useGenericApi<I_KardexResponse>(KARDEX_ENDPOINTS_CONFIG)

	// ✅ Construir queryParams correctamente
	const queryParams: Record<string, any> = {}

	if (paginationParams.page !== undefined) queryParams.page = paginationParams.page
	if (paginationParams.limit !== undefined) queryParams.limit = paginationParams.limit

	if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0)
		queryParams.filters = JSON.stringify(paginationParams.filters)

	if (paginationParams.sort && paginationParams.sort.length > 0) {
		const sortObjects = (paginationParams.sort as unknown as string[]).map(sortString => {
			const [field, order] = sortString.split(':')
			return {
				orderBy: field as keyof I_Kardex,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	// ✅ Usa el endpoint "lasted" como un query dinámico con parámetros
	const lastedQuery = genericApi.useCustomQueryEndpoint?.('lasted', queryParams)

	// ✅ Método para obtener un registro por ID
	const getRecordById = useCallback(
		async (id: I_KardexId) => {
			try {
				const response = await genericApi.executeCustomEndpoint('getById', {
					urlParams: { id },
				})
				return response.data
			} catch (error) {
				throw error
			}
		},
		[genericApi]
	)

	return {
		// Datos del query principal
		records: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Datos del query "lasted"
		lastedRecords: lastedQuery?.data,
		loadingLasted: lastedQuery?.isLoading,
		errorLasted: lastedQuery?.error?.message,

		// Funciones
		refetchRecords: query.refetch,
		refetchLasted: lastedQuery?.refetch,

		// Funciones CRUD y específicas
		getRecordById,

		// Mutaciones y funciones generales
		mutations: genericApi.mutations,
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
