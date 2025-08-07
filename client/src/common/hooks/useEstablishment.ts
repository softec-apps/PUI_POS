import api from '@/lib/axios'
import { useCallback } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { ESTABLISHMENT_ENDPOINTS_CONFIG } from '@/common/configs/api/establishment-endpoints.config'
import {
	I_CreateEstablishment,
	I_Establishment,
	I_UpdateEstablishment,
	I_EstablishmentResponse,
	I_EstablishmentId,
} from '@/common/types/modules/establishment'

interface UseEstablishmentParamsProps {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Establishment; order: 'asc' | 'desc' }>
}

export const useEstablishment = (paginationParams: UseEstablishmentParamsProps = {}) => {
	const genericApi = useGenericApi<I_EstablishmentResponse, I_CreateEstablishment, I_UpdateEstablishment>(
		ESTABLISHMENT_ENDPOINTS_CONFIG
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
				orderBy: field as keyof I_Establishment,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	// ✅ Memoizar la función getEstablishmentById para evitar re-creaciones
	const getEstablishmentById = useCallback(async (id: I_EstablishmentId) => {
		try {
			const response = await api.get(`${ENDPOINT_API.ESTABLISHMENT}/${id}`)
			return response.data.data
		} catch (error) {
			throw error
		}
	}, [])

	return {
		// Datos del query - manteniendo los mismos nombres
		recordsData: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones - manteniendo los mismos nombres
		refetchRecords: query.refetch,

		// Funciones CRUD - manteniendo los mismos nombres
		getEstablishmentById: getEstablishmentById,
		createRecord: genericApi.create,
		updateRecord: genericApi.update,

		// Estados granulares de loading - manteniendo los mismos nombres
		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,

		// Mutations para control avanzado - ahora completamente dinámicas
		mutations: genericApi.mutations, // Contiene todas las mutations configuradas

		// Funciones adicionales del API genérico - manteniendo los mismos nombres
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
