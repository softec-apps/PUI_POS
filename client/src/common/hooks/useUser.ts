import { useGenericApi } from '@/common/hooks/useGenericApi'
import { USER_ENDPOINTS_CONFIG } from '@/common/configs/api/user-endpoints.config'
import { I_CreateUser, I_User, I_UpdateUser, I_UserResponse } from '@/common/types/modules/user'

interface UseUserParamsProps {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_User; order: 'asc' | 'desc' }>
}

export const useUser = (paginationParams: UseUserParamsProps = {}) => {
	const genericApi = useGenericApi<I_UserResponse, I_CreateUser, I_UpdateUser>(USER_ENDPOINTS_CONFIG)

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
				orderBy: field as keyof I_User,
				order: (order || 'asc') as 'asc' | 'desc',
			}
		})
		queryParams.sort = JSON.stringify(sortObjects)
	}

	// ✅ Parámetro de búsqueda
	if (paginationParams.search && paginationParams.search.trim()) queryParams.search = paginationParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación
	const query = genericApi.buildQuery(queryParams)

	return {
		// ✅ Datos del query - manteniendo los mismos nombres
		recordsData: query.data,
		loading: query.isLoading,
		error: query.error?.message,

		// ✅ Funciones de consulta
		refetchRecords: query.refetch,

		// ✅ Funciones CRUD completas según USER_ENDPOINTS_CONFIG
		getById: genericApi.getById, // GET /:id
		createRecord: genericApi.create, // POST /
		updateRecord: genericApi.update, // PATCH /:id
		softDeleteRecord: genericApi.delete, // DELETE /:id (soft delete)
		restoreRecord: genericApi.restore, // PATCH /:id/restore
		hardDeleteRecord: genericApi.hardDelete, // DELETE /:id/hard-delete

		// ✅ Estados granulares de loading
		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,
		isRestoring: genericApi.isRestoring,
		isSoftDeleting: genericApi.isDeleting,
		isHardDeleting: genericApi.isHardDeleting,

		// ✅ Mutations para control avanzado
		mutations: genericApi.mutations, // Contiene todas las mutations configuradas

		// ✅ Funciones adicionales del API genérico
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
