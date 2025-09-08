import api from '@/lib/axios'
import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
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

export interface I_BulkImportResponse {
	successCount: number
	errorCount: number
	createdCount: number
	updatedCount: number
	totalProcessed: number
	kardexEntriesCreated: number
	successMessages: string[]
	errorMessages: string[]
	newCategoriesCreated?: number
	newCompaniesCreated?: number
}

export interface I_BulkImportOptions {
	continueOnError?: boolean
	updateExisting?: boolean
	categoryId?: string
	brandId?: string
	supplierId?: string
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

	// ✅ Mutation para importación masiva
	const bulkImportMutation = useMutation<I_BulkImportResponse, Error, { file: File; options: I_BulkImportOptions }>({
		mutationFn: async ({ file, options }) => {
			const formData = new FormData()
			formData.append('file', file)

			// Agregar opciones como campos del formData
			Object.entries(options).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value.toString())
				}
			})

			const response = await api.post('/product/bulk-import/excel', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			return response.data.data
		},
		onSuccess: data => {
			// ✅ Invalidar automáticamente todas las queries relacionadas
			// Esto se hace gracias a extraInvalidateKeys en la configuración
			genericApi.refetch()

			// Mostrar mensajes de éxito
			if (data.successCount > 0) {
				if (data.errorCount === 0) {
					const successMsg = `${data.successCount} productos procesados exitosamente`
					const extraInfo = []
					if (data.newCategoriesCreated && data.newCategoriesCreated > 0) {
						extraInfo.push(`${data.newCategoriesCreated} categorías creadas`)
					}
					if (data.newCompaniesCreated && data.newCompaniesCreated > 0) {
						extraInfo.push(`${data.newCompaniesCreated} compañías creadas`)
					}

					toast.success(extraInfo.length > 0 ? `${successMsg} (${extraInfo.join(', ')})` : successMsg)
				} else {
					toast.warning(`${data.successCount} productos procesados exitosamente, ${data.errorCount} con errores`)
				}
			}

			// Mostrar errores específicos
			if (data.errorCount > 0 && data.errorMessages) {
				data.errorMessages.slice(0, 3).forEach((message: string) => {
					toast.error(message)
				})
			}
		},
		onError: (error: any) => {
			console.log('ERRRR', error)
			toast.error(error.response?.data?.message)
		},
	})

	// ✅ Función de conveniencia para importación masiva
	const bulkImport = useCallback(
		async (file: File, options: I_BulkImportOptions = {}) => {
			return await bulkImportMutation.mutateAsync({ file, options })
		},
		[bulkImportMutation]
	)

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

		// ✅ Importación masiva
		bulkImport: bulkImport,
		isBulkImporting: bulkImportMutation.isPending,
		bulkImportError: bulkImportMutation.error,
		bulkImportData: bulkImportMutation.data,

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
