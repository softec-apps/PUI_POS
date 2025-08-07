import api from '@/lib/axios'
import { useCallback } from 'react'
import {
	I_Attribute,
	I_CreateAttribute,
	I_UpdateAttribute,
	I_AttributesResponse,
	I_AttributeId,
} from '@/common/types/modules/attribute'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { ATTRIBUTE_ENDPOINTS_CONFIG } from '@/common/configs/api/attribute-endpoints.config'

interface UseAttributesParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: I_Attribute; order: 'asc' | 'desc' }>
}

export const useAttribute = (paginationParams: UseAttributesParams = {}) => {
	const genericApi = useGenericApi<I_AttributesResponse, I_CreateAttribute, I_UpdateAttribute>(
		ATTRIBUTE_ENDPOINTS_CONFIG
	)

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
				orderBy: field as keyof I_Attribute,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	// Método para obtener un atributo por ID
	const getAttributeById = useCallback(async (id: I_AttributeId) => {
		try {
			const response = await api.get(`${ENDPOINT_API.ATRIBUTE}/${id}`)
			return response.data.data
		} catch (error) {
			throw error
		}
	}, []) // Sin dependencias porque api y ENDPOINT_API son estables

	return {
		// Datos del query
		attributes: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones
		refetchAttributes: query.refetch,

		// Funciones CRUD
		getAttributeById: getAttributeById,
		createAttribute: genericApi.create,
		updateAttribute: genericApi.update,
		hardDeleteAttribute: genericApi.hardDelete,

		// Estados granulares de loading
		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,
		isHardDeleting: genericApi.isHardDeleting,

		// Mutations para control avanzado - ahora completamente dinámicas
		mutations: genericApi.mutations,

		// Funciones adicionales del API genérico
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
