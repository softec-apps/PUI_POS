import { useGenericApi } from '@/common/hooks/useGenericApi'
import { BRAND_ENDPOINTS_CONFIG } from '@/common/configs/api/brand-endpoints.config'
import { I_CreateBrand, I_Brand, I_UpdateBrand, I_BrandsResponse } from '@/common/types/modules/brand'

interface UseBrandParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Brand; order: 'asc' | 'desc' }>
}

export const useBrand = (paginationParams: UseBrandParams = {}) => {
	const api = useGenericApi<I_BrandsResponse, I_CreateBrand, I_UpdateBrand>(BRAND_ENDPOINTS_CONFIG)

	// ✅ Construir queryParams correctamente
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const queryParams: Record<string, any> = {}

	// Parámetros básicos
	if (paginationParams.page !== undefined) queryParams.page = paginationParams.page
	if (paginationParams.limit !== undefined) queryParams.limit = paginationParams.limit

	// ✅ Serializar filters como JSON si existe
	if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0)
		queryParams.filters = JSON.stringify(paginationParams.filters)

	// ✅ Convertir sort de string a formato objeto
	if (paginationParams.sort && paginationParams.sort.length > 0) {
		const sortObjects = (paginationParams.sort as unknown as string[]).map(sortString => {
			const [field, order] = sortString.split(':')
			return {
				orderBy: field as keyof I_Brand,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = api.buildQuery(queryParams)

	return {
		// Datos del query - manteniendo los mismos nombres
		brands: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones - manteniendo los mismos nombres
		refetchBrands: query.refetch,

		// Funciones CRUD - manteniendo los mismos nombres
		createBrand: api.create,
		updateBrand: api.update,
		hardDeleteBrand: api.hardDelete,

		// Estados granulares de loading - manteniendo los mismos nombres
		isCreating: api.isCreating,
		isUpdating: api.isUpdating,
		isHardDeleting: api.isHardDeleting,

		// Mutations para control avanzado - ahora completamente dinámicas
		mutations: api.mutations, // Contiene todas las mutations configuradas

		// Funciones adicionales del API genérico - manteniendo los mismos nombres
		executeCustomEndpoint: api.executeCustomEndpoint,
		apiService: api.apiService,
	}
}
