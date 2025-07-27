import api from '@/lib/axios'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { ROUTE_PATH } from '@/common//constants/routes-const'
import { PRODUCT_ENDPOINTS_CONFIG } from '@/common/configs/api/product-endpoints.config'
import { I_CreateProduct, I_Product, I_UpdateProduct, I_ProductResponse } from '@/modules/product/types/product'
import { ENDPOINT_API } from '../constants/APIEndpoint-const'
import { useCallback } from 'react'

interface Props {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Product; order: 'asc' | 'desc' }>
	// ✅ Agregar parámetro para controlar si el query debe ejecutarse automáticamente
	enabled?: boolean
}

export const useProduct = (paginationParams: Props = {}) => {
	const { enabled = false, ...restParams } = paginationParams
	const genericApi = useGenericApi<I_ProductResponse, I_CreateProduct, I_UpdateProduct>(PRODUCT_ENDPOINTS_CONFIG)

	// ✅ Construir queryParams correctamente
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const queryParams: Record<string, any> = {}

	// Parámetros básicos
	if (restParams.page !== undefined) queryParams.page = restParams.page
	if (restParams.limit !== undefined) queryParams.limit = restParams.limit

	// ✅ Serializar filters como JSON si existe
	if (restParams.filters && Object.keys(restParams.filters).length > 0)
		queryParams.filters = JSON.stringify(restParams.filters)

	// ✅ CORRECCIÓN: Convertir sort de string a formato objeto
	if (restParams.sort && restParams.sort.length > 0) {
		const sortObjects = (restParams.sort as unknown as string[]).map(sortString => {
			const [field, order] = sortString.split(':')
			return {
				orderBy: field as keyof I_Product,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (restParams.search && restParams.search.trim()) queryParams.search = restParams.search.trim()

	// ✅ Solo ejecutar el query si está habilitado
	const query = genericApi.buildQuery(queryParams, { enabled })

	// ✅ Memoizar la función getAttributeById para evitar re-creaciones
	const getAttributeById = useCallback(async (id: string) => {
		try {
			const response = await api.get(`${ENDPOINT_API.PRODUCT}/${id}`)
			return response.data.data
		} catch (error) {
			console.error(`Error fetching attribute with ID ${id}:`, error)
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
		getAttributeById: getAttributeById,
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
