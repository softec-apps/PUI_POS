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
		(params?: PaginationParams) => {
			if (!params || Object.keys(params).length === 0) return baseQueryKey

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
			return paramString ? [...baseQueryKey, paramString] : baseQueryKey
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
				refetchOnWindowFocus: true, // <-- Refresca al cambiar de pestaña
				refetchOnReconnect: true, // <-- Si vuelves de offline a online
				refetchOnMount: true, // <-- Siempre que el comp. se monta
				staleTime: config.staleTime ?? 5 * 60 * 1000,
				enabled: config.enabled ?? true,
				refetchInterval: false, // Cambia a un número si quieres polling
			})
		},
		[apiService, buildQueryKey, config.endpoints?.list, config.enabled, config.staleTime]
	)

	// ✅ Crear mutations dinámicamente sin usar useCallback aquí
	// En el método createGenericMutation dentro de useGenericApi
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
			onSuccess: data => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				queryClient.setQueryData(baseQueryKey, (oldData: any) => {
					if (!oldData?.data?.items) return oldData
					return {
						...oldData,
						data: {
							...oldData.data,
							items: [...oldData.data.items, data],
							pagination: {
								...oldData.data.pagination,
								totalRecords: oldData.data.pagination.totalRecords + 1,
							},
						},
					}
				})

				invalidateQueries()

				extraInvalidateKeys.forEach(keyArr => {
					queryClient.invalidateQueries({ queryKey: keyArr, exact: false })
				})

				const message = successMessageKey ? config.successMessages?.[successMessageKey] : undefined
				if (message) toast.success(message)
			},
			onError: error => {
				handleHttpToast(error as unknown as HttpErrorResponse)
			},
		})
	}

	// ✅ Crear mutations dinámicamente basado en los endpoints configurados
	const mutations = Object.keys(config.endpoints || {}).reduce(
		(acc, endpointKey) => {
			if (endpointKey === 'list') return acc // Skip list endpoint
			const mutation = createGenericMutation(endpointKey, endpointKey)
			acc[endpointKey] = mutation
			return acc
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{} as Record<string, any>
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

		// API service for advanced usage
		apiService,
	}
}
