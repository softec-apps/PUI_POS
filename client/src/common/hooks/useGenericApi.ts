/* eslint-disable react-hooks/rules-of-hooks */
import { toast } from 'sonner'
import { useMemo, useCallback } from 'react'
import { ApiService } from '@/shared/services/api.service'
import { ApiConfig, PaginationParams } from '@/common/types/api'
import { HttpErrorResponse } from '@/common/types/httpErrorResponse'
import { handleHttpToast } from '@/common/helpers/handleHttpToast-helper'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useGenericApi = <T, CreateT, UpdateT>(config: ApiConfig) => {
	const queryClient = useQueryClient()

	// ✅ Memoizar el apiService para evitar recreaciones
	const apiService = useMemo(() => new ApiService(config.baseEndpoint), [config.baseEndpoint])

	// ✅ Memoizar query keys
	const baseQueryKey = useMemo(() => config.queryKey || [config.baseEndpoint], [config.queryKey, config.baseEndpoint])

	const buildQueryKey = useCallback(
		(params?: PaginationParams, endpointKey?: string) => {
			// Incluir endpointKey si se proporciona (para queries personalizadas)
			const baseKey = endpointKey ? [...baseQueryKey, endpointKey] : baseQueryKey

			if (!params || Object.keys(params).length === 0) return baseKey

			// ✅ Crear un hash estable de los parámetros
			const sortedParams = Object.keys(params)
				.sort()
				.reduce(
					(acc, key) => {
						const value = params[key]
						if (value !== undefined && value !== null && value !== '') {
							acc[key] = value
						}
						return acc
					},
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					{} as Record<string, any>
				)

			const paramString = JSON.stringify(sortedParams)
			return paramString ? [...baseKey, paramString] : baseKey
		},
		[baseQueryKey]
	)

	// ✅ Memoizar invalidación de cache
	const invalidateQueries = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: baseQueryKey,
			exact: false,
		})
	}, [queryClient, baseQueryKey])

	// ✅ Query genérico optimizado
	const buildQuery = useCallback(
		(params: PaginationParams = {}) => {
			const listEndpoint = config.endpoints?.list || { path: '', method: 'GET' as const }

			return useQuery({
				queryKey: buildQueryKey(params),
				queryFn: async () => {
					return await apiService.executeRequest<T>(listEndpoint, {
						queryParams: params,
					})
				},
				retry: 2,
				refetchOnWindowFocus: true,
				refetchOnReconnect: true,
				refetchOnMount: true,
				staleTime: config.staleTime ?? 5 * 60 * 1000,
				enabled: config.enabled ?? true,
				refetchInterval: false,
			})
		},
		[apiService, buildQueryKey, config.endpoints?.list, config.enabled, config.staleTime]
	)

	// ✅ Crear mutations dinámicamente sin usar useCallback aquí
	const createGenericMutation = (endpointKey: string, successMessageKey?: string) => {
		const endpoint = config.endpoints?.[endpointKey]
		if (!endpoint) throw new Error(`Endpoint '${endpointKey}' no configurado`)

		// Keys extra de invalidación, si existen
		const extraInvalidateKeys = config.extraInvalidateKeys || []

		return useMutation({
			mutationFn: async (options: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				urlParams?: Record<string, any>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				queryParams?: Record<string, any>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				data?: any
			}) => {
				return await apiService.executeRequest(endpoint, options)
			},
			onSuccess: (response: { message?: string; [key: string]: any }) => {
				// Actualizar el cache si aplica
				queryClient.setQueryData(baseQueryKey, (oldData: any) => {
					if (!oldData?.data?.items) return oldData
					return {
						...oldData,
						data: {
							...oldData.data,
							items: [...oldData.data.items, response],
							pagination: {
								...oldData.data.pagination,
								totalRecords: oldData.data.pagination.totalRecords + 1,
							},
						},
					}
				})

				invalidateQueries()

				extraInvalidateKeys.forEach(keyArr => queryClient.invalidateQueries({ queryKey: keyArr, exact: false }))

				if (response?.message) toast.success(response.message)
			},
			onError: error => {
				handleHttpToast(error as unknown as HttpErrorResponse)
			},
		})
	}

	// ✅ Crear mutations dinámicamente basado en los endpoints configurados
	const mutations = Object.keys(config.endpoints || {}).reduce(
		(acc, endpointKey) => {
			const endpoint = config.endpoints?.[endpointKey]
			if (!endpoint) return acc

			// Saltar endpoints tipo GET sin params → serán tratados como queries, no mutations
			if (endpoint.method === 'GET' && (!endpoint.params || endpoint.params.length === 0)) return acc

			// Saltar también 'list' porque ya tiene su query propia
			if (endpointKey === 'list') return acc

			const mutation = createGenericMutation(endpointKey, endpointKey)
			acc[endpointKey] = mutation
			return acc
		},
		{} as Record<string, any>
	)

	// ✅ Versión corregida de useCustomQueryEndpoint
	const useCustomQueryEndpoint = useCallback(
		(endpointKey: string, rawQueryParams: Record<string, any> = {}) => {
			const endpoint = config.endpoints?.[endpointKey]
			if (!endpoint || endpoint.method !== 'GET')
				throw new Error(`Endpoint '${endpointKey}' no configurado o no es tipo GET`)

			// Clonar y normalizar los parámetros
			const queryParams = { ...rawQueryParams }

			// Serializar filters si existe y es un objeto
			if (queryParams.filters && typeof queryParams.filters === 'object') {
				queryParams.filters = JSON.stringify(queryParams.filters)
			}

			// Serializar sort si existe y es un array
			if (queryParams.sort && Array.isArray(queryParams.sort)) {
				queryParams.sort = JSON.stringify(
					queryParams.sort.map(item => {
						if (typeof item === 'string') {
							const [field, order] = item.split(':')
							return { orderBy: field, order: order || 'asc' }
						}
						return item
					})
				)
			}

			const queryKey = buildQueryKey(queryParams, endpointKey)

			return useQuery({
				queryKey,
				queryFn: async () => {
					return await apiService.executeRequest<T>(endpoint, {
						// Pasar los parámetros ya serializados
						queryParams,
					})
				},
				retry: 2,
				refetchOnWindowFocus: true,
				refetchOnReconnect: true,
				refetchOnMount: true,
				staleTime: config.staleTime ?? 5 * 60 * 1000,
				enabled: config.enabled ?? true,
				refetchInterval: false,
			})
		},
		[apiService, buildQueryKey, config.endpoints, config.enabled, config.staleTime]
	)

	// ✅ Funciones de conveniencia optimizadas
	const executeEndpoint = async (
		endpointKey: string,
		options: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			urlParams?: Record<string, any>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			queryParams?: Record<string, any>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data?: any
		} = {}
	) => {
		const mutation = mutations[endpointKey]
		if (!mutation) throw new Error(`Endpoint '${endpointKey}' no configurado`)
		return mutation.mutateAsync(options)
	}

	// ✅ Helper para operaciones CRUD comunes
	const create = async (data: CreateT) => executeEndpoint('create', { data })
	const update = async (id: string | number, data: Partial<UpdateT>) =>
		executeEndpoint('update', { urlParams: { id }, data })
	const deleteItem = async (id: string | number) => executeEndpoint('softDelete', { urlParams: { id } })
	const restore = async (id: string | number) => executeEndpoint('restore', { urlParams: { id } })
	const hardDeleteItem = async (id: string | number) => executeEndpoint('hardDelete', { urlParams: { id } })
	const refetch = () => invalidateQueries()

	// ✅ Estados de loading
	const getLoadingState = (endpointKey: string) => mutations[endpointKey]?.isPending ?? false

	return {
		// Query functions
		buildQuery,
		refetch,

		// CRUD operations
		create,
		update,
		restore,
		delete: deleteItem,
		hardDelete: hardDeleteItem,

		// Custom endpoint execution
		executeCustomEndpoint: executeEndpoint,

		// Loading states dinámicos
		isLoading: getLoadingState,
		isCreating: mutations.create?.isPending ?? false,
		isUpdating: mutations.update?.isPending ?? false,
		isDeleting: mutations.delete?.isPending ?? false,
		isRestoring: mutations.restore?.isPending ?? false,
		isHardDeleting: mutations.hardDelete?.isPending ?? false,

		// Raw mutations dinámicas
		mutations,

		// Query personalizada para GET sin parámetros
		useCustomQueryEndpoint,

		// API service for advanced usage
		apiService,
	}
}
