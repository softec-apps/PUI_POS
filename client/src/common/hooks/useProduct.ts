import api from '@/lib/axios'
import { useCallback } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { PRODUCT_ENDPOINTS_CONFIG } from '@/common/configs/api/product-endpoints.config'
import {
	I_CreateProduct,
	I_Product,
	I_UpdateProduct,
	I_ProductResponse,
	I_IdProduct,
} from '@/common/types/modules/product'

interface UseProductParamsProps {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Product; order: 'asc' | 'desc' }>
}

export const useProduct = (paginationParams: UseProductParamsProps = {}) => {
	const genericApi = useGenericApi<I_ProductResponse, I_CreateProduct, I_UpdateProduct>(PRODUCT_ENDPOINTS_CONFIG)

	// ✅ Construir queryParams correctamente
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const queryParams: Record<string, any> = {}

	// Parámetros básicos
	if (paginationParams.page !== undefined) queryParams.page = paginationParams.page
	if (paginationParams.limit !== undefined) queryParams.limit = paginationParams.limit

	// ✅ Serializar filters como JSON si existe
	if (paginationParams.filters && Object.keys(paginationParams.filters).length > 0)
		queryParams.filters = JSON.stringify(paginationParams.filters)

	// ✅ CORRECCIÓN: Convertir sort de string a formato objeto
	if (paginationParams.sort && paginationParams.sort.length > 0) {
		const sortObjects = (paginationParams.sort as unknown as string[]).map(sortString => {
			const [field, order] = sortString.split(':')
			return {
				orderBy: field as keyof I_Product,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	// ✅ Memoizar la función getProductById para evitar re-creaciones
	const getProductById = useCallback(async (id: I_IdProduct) => {
		try {
			const response = await api.get(`${ENDPOINT_API.PRODUCT}/${id}`)
			return response.data.data
		} catch (error) {
			throw error
		}
	}, []) // Sin dependencias porque api y ENDPOINT_API son estables

	return {
		// Datos del query - manteniendo los mismos nombres
		recordsData: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones - manteniendo los mismos nombres
		refetchRecords: query.refetch,

		// Funciones CRUD - manteniendo los mismos nombres
		getProductById: getProductById,
		createRecord: genericApi.create,
		updateRecord: genericApi.update,
		restoreRecord: genericApi.restore,
		softDeleteRecord: genericApi.delete,
		hardDeleteRecord: genericApi.hardDelete,

		// Estados granulares de loading - manteniendo los mismos nombres
		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,
		isRestoring: genericApi.isRestoring,
		isSoftDeleting: genericApi.isDeleting,
		isHardDeleting: genericApi.isHardDeleting,

		// Mutations para control avanzado - ahora completamente dinámicas
		mutations: genericApi.mutations, // Contiene todas las mutations configuradas

		// Funciones adicionales del API genérico - manteniendo los mismos nombres
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
