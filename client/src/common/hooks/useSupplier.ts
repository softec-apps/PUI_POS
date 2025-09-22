import { useGenericApi } from '@/common/hooks/useGenericApi'
import { SUPPLIER_ENDPOINTS_CONFIG } from '@/common/configs/api/supplier-endpoints.config'
import {
	I_CreateSupplier,
	I_Supplier,
	I_UpdateSupplier,
	I_SupplierResponse,
	I_IdSupplier,
} from '@/common/types/modules/supplier'
import { useCallback } from 'react'
import { ENDPOINT_API } from '../constants/APIEndpoint-const'
import api from '@/lib/axios'

export interface useSupplierProps {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Supplier; order: 'asc' | 'desc' }>
}

export const useSupplier = (paginationParams: useSupplierProps = {}) => {
	const genericApi = useGenericApi<I_SupplierResponse, I_CreateSupplier, I_UpdateSupplier>(SUPPLIER_ENDPOINTS_CONFIG)

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
				orderBy: field as keyof I_Supplier,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	const getSupplierById = useCallback(async (id: I_IdSupplier) => {
		try {
			const response = await api.get(`${ENDPOINT_API.SUPPLIER}/${id}`)
			return response.data.data
		} catch (error) {
			throw error
		}
	}, [])

	return {
		// Datos del query
		recordsData: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// Funciones
		refetchRecords: query.refetch,
		getSupplierById: getSupplierById,

		// Funciones CRUD
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
		mutations: genericApi.mutations, // Contiene todas las mutations configuradas

		// Funciones adicionales del API genérico
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
