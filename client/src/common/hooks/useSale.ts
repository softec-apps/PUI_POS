import api from '@/lib/axios'
import { toast } from 'sonner'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { SALE_ENDPOINTS_CONFIG } from '@/common/configs/api/sale-endpoints.config'
import { handleHttpToast } from '@/common/helpers/handleHttpToast-helper'
import { HttpErrorResponse } from '@/common/types/httpErrorResponse'
import { I_CreateSale, I_IdSale, I_Sale, I_SalesResponse } from '@/common/types/modules/sale'

export interface UseSaleParams {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Sale; order: 'asc' | 'desc' }>
}

export const useSale = (paginationParams: UseSaleParams = {}) => {
	const genericApi = useGenericApi<I_SalesResponse, I_CreateSale>(SALE_ENDPOINTS_CONFIG)
	const queryClient = useQueryClient()

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
			const [field, order] = sortString?.split(':')
			return {
				orderBy: field as keyof I_Sale,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	// ✅ Función para invalidar queries relacionadas
	const invalidateRelatedQueries = useCallback(() => {
		// Invalidar queries de ventas
		queryClient.invalidateQueries({
			queryKey: [ENDPOINT_API.SALE],
			exact: false,
		})

		// Invalidar queries adicionales configuradas
		const extraInvalidateKeys = SALE_ENDPOINTS_CONFIG.extraInvalidateKeys || []
		extraInvalidateKeys.forEach(keyArr => {
			queryClient.invalidateQueries({ queryKey: keyArr, exact: false })
		})
	}, [queryClient])

	// ✅ Memoizar la función getSaleById para evitar re-creaciones
	const getSaleById = useCallback(async (id: I_IdSale) => {
		try {
			const response = await api.get(`${ENDPOINT_API.SALE}/${id}`)
			return response.data.data
		} catch (error) {
			throw error
		}
	}, [])

	// ✅ Función para crear venta simple (sin facturación electrónica)
	const createSimpleSale = useCallback(
		async (data: I_CreateSale) => {
			try {
				const response = await api.post(`${ENDPOINT_API.SALE}/simple`, data)

				// Invalidar queries relacionadas
				invalidateRelatedQueries()

				// Mostrar mensaje de éxito
				if (response.data?.message) {
					toast.success(response.data.message)
				}

				return response.data
			} catch (error) {
				// Manejar errores con toast
				handleHttpToast(error as unknown as HttpErrorResponse)
				throw error
			}
		},
		[invalidateRelatedQueries]
	)

	// ✅ Función para crear venta con facturación SRI
	const createSriSale = useCallback(
		async (data: I_CreateSale) => {
			try {
				const response = await api.post(`${ENDPOINT_API.SALE}/sri`, data)

				// Invalidar queries relacionadas
				invalidateRelatedQueries()

				// Mostrar mensaje de éxito
				if (response.data?.message) {
					toast.success(response.data.message)
				}

				return response.data
			} catch (error) {
				// Manejar errores con toast
				handleHttpToast(error as unknown as HttpErrorResponse)
				throw error
			}
		},
		[invalidateRelatedQueries]
	)

	return {
		// Datos del query
		recordsData: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones de consulta
		refetchRecords: query.refetch,
		getSaleById: getSaleById,

		// ✅ Funciones de creación específicas
		createSimpleSale: createSimpleSale,
		createSriSale: createSriSale,

		// Funciones CRUD genéricas (mantener por compatibilidad)
		createRecord: genericApi.create,
		updateRecord: genericApi.update,
		restoreRecord: genericApi.restore,
		softDeleteRecord: genericApi.delete,
		hardDeleteRecord: genericApi.hardDelete,

		// Estados granulares de loading
		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,
		isRestoring: genericApi.isRestoring,
		isSoftDeleting: genericApi.isDeleting,
		isHardDeleting: genericApi.isHardDeleting,

		// Mutations para control avanzado - ahora completamente dinámicas
		mutations: genericApi.mutations,

		// Funciones adicionales del GENERICAPI genérico
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
