import api from '@/lib/axios'
import { toast } from 'sonner'
import { useCallback } from 'react'
import { useGenericApi } from '@/common/hooks/useGenericApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'
import { HttpErrorResponse } from '@/common/types/httpErrorResponse'
import { handleHttpToast } from '@/common/helpers/handleHttpToast-helper'
import { AUTH_ENDPOINTS_CONFIG } from '@/common/configs/api/auth-endpoints.config'

// Tipos para la respuesta del endpoint /me
export interface I_UserPhoto {
	id: string
	path: string
}

export interface I_UserRole {
	id: number
	name: string
	__entity: string
}

export interface I_UserStatus {
	id: number
	name: string
	__entity: string
}

export interface I_UserProfile {
	id: string
	email: string
	dni: string | null
	provider: string
	socialId: string | null
	firstName: string
	lastName: string
	photo: I_UserPhoto | null
	role: I_UserRole
	status: I_UserStatus
	createdAt: string
	updatedAt: string
	deletedAt: string | null
}

// Tipos para operaciones de auth
export interface I_LoginData {
	email: string
	password: string
}

export interface I_RegisterData {
	email: string
	password: string
	firstName: string
	lastName: string
}

export interface I_UpdateProfileData {
	firstName?: string
	lastName?: string
	dni?: string
}

export const useAuth = () => {
	const genericApi = useGenericApi(AUTH_ENDPOINTS_CONFIG)
	const queryClient = useQueryClient()

	// ✅ Query para obtener datos del usuario actual (/me)
	const userQuery = useQuery({
		queryKey: [ENDPOINT_API.AUTH, 'me'],
		queryFn: async (): Promise<I_UserProfile> => {
			const response = await api.get(`${ENDPOINT_API.AUTH}/me`)
			return response.data
		},
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 60 * 60 * 1000, // 1 hora
	})

	// ✅ Función para invalidar queries relacionadas
	const invalidateRelatedQueries = useCallback(() => {
		// Invalidar queries de auth
		queryClient.invalidateQueries({
			queryKey: [ENDPOINT_API.AUTH],
			exact: false,
		})

		// Invalidar queries adicionales configuradas
		const extraInvalidateKeys = AUTH_ENDPOINTS_CONFIG.extraInvalidateKeys || []
		extraInvalidateKeys.forEach(keyArr => {
			queryClient.invalidateQueries({ queryKey: keyArr, exact: false })
		})
	}, [queryClient])

	// ✅ Función para login
	const login = useCallback(
		async (data: I_LoginData) => {
			try {
				const response = await api.post(`${ENDPOINT_API.AUTH}/email/login`, data)

				// Invalidar queries relacionadas
				invalidateRelatedQueries()

				// Mostrar mensaje de éxito
				if (response.data?.message) toast.success(response.data.message)

				return response.data
			} catch (error) {
				handleHttpToast(error as unknown as HttpErrorResponse)
				throw error
			}
		},
		[invalidateRelatedQueries]
	)

	// ✅ Función para register
	const register = useCallback(async (data: I_RegisterData) => {
		try {
			const response = await api.post(`${ENDPOINT_API.AUTH}/email/register`, data)

			// Mostrar mensaje de éxito
			if (response.data?.message) toast.success(response.data.message)

			return response.data
		} catch (error) {
			handleHttpToast(error as unknown as HttpErrorResponse)
			throw error
		}
	}, [])

	// ✅ Función para actualizar perfil
	const updateProfile = useCallback(
		async (data: I_UpdateProfileData) => {
			try {
				const response = await api.patch(`${ENDPOINT_API.AUTH}/me`, data)

				// Invalidar query del usuario para refrescar datos
				queryClient.invalidateQueries({
					queryKey: [ENDPOINT_API.AUTH, 'me'],
				})

				// Mostrar mensaje de éxito
				if (response.data?.message) toast.success(response.data.message)

				return response.data
			} catch (error) {
				handleHttpToast(error as unknown as HttpErrorResponse)
				throw error
			}
		},
		[queryClient]
	)

	// ✅ Función para logout
	const logout = useCallback(async () => {
		try {
			await api.post(`${ENDPOINT_API.AUTH}/logout`)

			// Limpiar todas las queries del cache
			queryClient.clear()

			toast.success('Sesión cerrada exitosamente')
		} catch (error) {
			handleHttpToast(error as unknown as HttpErrorResponse)
			throw error
		}
	}, [queryClient])

	// ✅ Función para refresh token
	const refreshToken = useCallback(async () => {
		try {
			const response = await api.post(`${ENDPOINT_API.AUTH}/refresh`)
			return response.data
		} catch (error) {
			handleHttpToast(error as unknown as HttpErrorResponse)
			throw error
		}
	}, [])

	// ✅ Función para forgot password
	const forgotPassword = useCallback(async (email: string) => {
		try {
			const response = await api.post(`${ENDPOINT_API.AUTH}/forgot/password`, { email })

			if (response.data?.message) toast.success(response.data.message)

			return response.data
		} catch (error) {
			handleHttpToast(error as unknown as HttpErrorResponse)
			throw error
		}
	}, [])

	// ✅ Función para reset password
	const resetPassword = useCallback(async (token: string, password: string) => {
		try {
			const response = await api.post(`${ENDPOINT_API.AUTH}/reset/password`, {
				token,
				password,
			})

			if (response.data?.message) toast.success(response.data.message)

			return response.data
		} catch (error) {
			handleHttpToast(error as unknown as HttpErrorResponse)
			throw error
		}
	}, [])

	return {
		// ✅ Datos del usuario actual
		user: userQuery.data || null,
		isLoadingUser: userQuery.isLoading,
		userError: userQuery.error?.message,
		refetchUser: userQuery.refetch,

		// ✅ Funciones de autenticación
		login,
		register,
		logout,
		updateProfile,
		refreshToken,
		forgotPassword,
		resetPassword,

		// ✅ Estados de autenticación
		isAuthenticated: !!userQuery.data,
		isLoading: userQuery.isLoading,

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

		// Mutations para control avanzado
		mutations: genericApi.mutations,

		// Funciones adicionales del API genérico
		executeCustomEndpoint: genericApi.executeCustomEndpoint,
		apiService: genericApi.apiService,
	}
}
