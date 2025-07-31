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
} from '@/modules/product/types/product'

interface UseProductParamsProps {
	page?: number
	limit?: number
	search?: string
	filters?: Record<string, string>
	sort?: Array<{ orderBy: keyof I_Product; order: 'asc' | 'desc' }>
	enabled?: boolean // ✅ Control para cuándo ejecutar el query
}

export const useProduct = (paginationParams: UseProductParamsProps = {}) => {
	const { enabled = true, ...restParams } = paginationParams
	
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

	// ✅ Manejar sort correctamente - verificar si ya es objeto o string
	if (restParams.sort && restParams.sort.length > 0) {
		// Si el primer elemento es un objeto, ya está en el formato correcto
		if (typeof restParams.sort[0] === 'object' && 'orderBy' in restParams.sort[0]) {
			queryParams.sort = JSON.stringify(restParams.sort)
		} else {
			// Si es string, convertir al formato objeto
			const sortObjects = (restParams.sort as unknown as string[]).map(sortString => {
				const [field, order] = sortString.split(':')
				return {
					orderBy: field as keyof I_Product,
					order: (order || 'asc') as 'asc' | 'desc',
				}
			})
			queryParams.sort = JSON.stringify(sortObjects)
		}
	}

	// ✅ Parámetro de búsqueda
	if (restParams.search && restParams.search.trim()) 
		queryParams.search = restParams.search.trim()

	// ✅ Usa el query dinámico con los parámetros de paginación y enabled
	const query = genericApi.buildQuery(queryParams, { enabled })

	// ✅ Función unificada para obtener producto por ID con múltiples enfoques
	const getProductById = useCallback(async (id: I_IdProduct) => {
		if (!id) {
			console.warn('getProductById: ID is required')
			return null
		}
		
		try {
			// ✅ Primer enfoque: usar el apiService del genericApi
			if (genericApi.apiService?.getById) {
				return await genericApi.apiService.getById(id)
			}
			
			const response = await api.get(`${ENDPOINT_API.PRODUCT}/${id}`)
			
			// ✅ Manejar diferentes estructuras de respuesta
			if (response.data?.data) {
				return response.data.data
			} else if (response.data) {
				return response.data
			}
			
			return response
		} catch (error) {
			console.error(`Error fetching product with ID ${id}:`, error)
			throw error
		}
	}, [genericApi.apiService])

	return {
		// ✅ Datos del query - usando nombres consistentes
		products: query.data?.data || query.data, // Maneja ambas estructuras
		recordsData: query.data, // Mantener compatibilidad con código existente
		loading: query.isLoading,
		error: query.error?.message,
		
		// ✅ Información adicional de paginación si está disponible
		totalRecords: query.data?.total,
		currentPage: query.data?.page,
		totalPages: query.data?.totalPages,
		
		// ✅ Funciones de consulta
		refetchRecords: query.refetch,
		refetchProducts: query.refetch, // Alias para compatibilidad
		
		// ✅ Funciones CRUD - nombres unificados
		getProductById,
		createRecord: genericApi.create,
		createProduct: genericApi.create, // Alias
		updateRecord: genericApi.update,
		updateProduct: genericApi.update, // Alias
		restoreRecord: genericApi.restore,
		restoreProduct: genericApi.restore, // Alias
		softDeleteRecord: genericApi.delete,
		softDeleteProduct: genericApi.delete, // Alias
		hardDeleteRecord: genericApi.hardDelete,
		hardDeleteProduct: genericApi.hardDelete, // Alias
		
		// ✅ Estados granulares de loading
		isCreating: genericApi.isCreating,
		isUpdating: genericApi.isUpdating,
		isRestoring: genericApi.isRestoring,
		isSoftDeleting: genericApi.isDeleting,
		isHardDeleting: genericApi.isHardDeleting,
		
		// ✅ Mutations y servicios adicionales
		mutations: genericApi.mutations,
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
		
		// ✅ Estado del query para control avanzado
		queryState: {
			isLoading: query.isLoading,
			isError: query.isError,
			isSuccess: query.isSuccess,
			isFetching: query.isFetching,
			enabled,
		}
	}
}

interface UseProductV2ParamsProps {
	productId?: I_IdProduct
	enabled?: boolean
	autoFetch?: boolean // Si se debe obtener automáticamente al montar
}

export const useProductV2 = (params: UseProductV2ParamsProps = {}) => {
	const { productId, enabled = true, autoFetch = false } = params
	
	const genericApi = useGenericApi<I_ProductResponse, I_CreateProduct, I_UpdateProduct>(PRODUCT_ENDPOINTS_CONFIG)

	// ✅ Query específico para un producto individual (solo si autoFetch está habilitado)
	const productQuery = genericApi.buildQuery(
		{}, 
		{ 
			enabled: enabled && autoFetch && !!productId,
			queryKey: ['product-detail', productId],
		}
	)

	// ✅ Función optimizada para obtener detalles del producto
	const getProductById = useCallback(async (id: I_IdProduct) => {
		if (!id) {
			throw new Error('Product ID is required')
		}

		try {
			// ✅ Intentar con apiService primero
			if (genericApi.apiService?.getById) {
				const result = await genericApi.apiService.getById(id)
				
				// ✅ Extraer solo los datos del producto de la respuesta del apiService
				if (result?.data) {
					return result.data // Solo los datos del producto
				}
	
				return result
			}

			// ✅ Fallback a axios directo
			const response = await api.get(`${ENDPOINT_API.PRODUCT}/${id}`)
			
			// ✅ La respuesta tiene estructura: { success, statusCode, message, data, meta }
			// Devolver solo response.data.data (los datos reales del producto)
			if (response.data?.data) {
				return response.data.data // ✅ Solo los datos del producto
			}
			
			// ✅ Fallback si la estructura es diferente
			return response.data || response
			
		} catch (error) {
			console.error(`❌ Error fetching product details for ID ${id}:`, error)
			throw error
		}
	}, [genericApi.apiService])

	// ✅ Función para obtener el producto automáticamente si se proporciona ID
	const fetchCurrentProduct = useCallback(async () => {
		if (!productId) return null
		return await getProductById(productId)
	}, [productId, getProductById])

	// ✅ Estado del producto actual si se usa autoFetch
	const currentProduct = autoFetch && productId ? 
		(productQuery.data?.data?.data || productQuery.data?.data || productQuery.data) : null

	return {
		// ✅ Datos específicos para detalles
		product: currentProduct,
		productData: currentProduct,
		loading: productQuery.isLoading,
		error: productQuery.error?.message,
		
		// ✅ Funciones principales para detalles
		getProductById,
		fetchCurrentProduct,
		refetchProduct: productQuery.refetch,
		
		// ✅ Funciones CRUD específicas
		updateProduct: genericApi.update,
		deleteProduct: genericApi.delete,
		restoreProduct: genericApi.restore,
		
		// ✅ Estados de operaciones
		isUpdating: genericApi.isUpdating,
		isDeleting: genericApi.isDeleting,
		isRestoring: genericApi.isRestoring,
		
		// ✅ Estado detallado del query
		queryState: {
			isLoading: productQuery.isLoading,
			isError: productQuery.isError,
			isSuccess: productQuery.isSuccess,
			isFetching: productQuery.isFetching,
			data: currentProduct,
		},
		
		// ✅ Servicios adicionales
		apiService: genericApi.apiService,
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
	}
}