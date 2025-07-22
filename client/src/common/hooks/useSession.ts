import api from '@/lib/axios'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { ApiUser, UserSession } from '@/common/types/roles'

// Cache global para evitar múltiples llamadas simultáneas
const userCache: {
	promise: Promise<ApiUser> | null
	data: ApiUser | null
	timestamp: number
	userId: string | null
} = {
	promise: null,
	data: null,
	timestamp: 0,
	userId: null,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

// Función optimizada para obtener datos del usuario con cache y reintentos
const fetchUserDataWithCache = async (userId: string): Promise<ApiUser> => {
	const now = Date.now()

	// Si tenemos datos en cache, son recientes y es para el mismo usuario, los devolvemos
	if (userCache.data && userCache.userId === userId && now - userCache.timestamp < CACHE_DURATION) {
		return userCache.data
	}

	// Si ya hay una petición en curso para el mismo usuario, la reutilizamos
	if (userCache.promise && userCache.userId === userId) {
		return userCache.promise
	}

	// Crear nueva petición con reintentos
	userCache.promise = (async () => {
		let lastError: any

		for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
			try {
				const response = await api.get(`/auth/me`)
				const userData: ApiUser = response.data

				// Actualizar cache
				userCache.data = userData
				userCache.userId = userId
				userCache.timestamp = now
				userCache.promise = null

				return userData
			} catch (error) {
				lastError = error

				// Si no es el último intento, esperar antes de reintentar
				if (attempt < MAX_RETRIES) {
					await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)))
				}
			}
		}

		// Limpiar cache en caso de error
		userCache.promise = null
		userCache.userId = null
		throw lastError
	})()

	return userCache.promise
}

export const useUserData = () => {
	const { data: session } = useSession() as { data: UserSession | null }
	const [userData, setUserData] = useState<ApiUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const userId = session?.user?.id

	const fetchUserData = useCallback(async () => {
		if (!userId) {
			setUserData(null)
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			setError(null)

			const data = await fetchUserDataWithCache(userId)
			setUserData(data)
		} catch (err: any) {
			console.error('Error fetching user data:', err)
			setError(err?.response?.data?.message || 'Error al obtener datos del usuario')
			setUserData(null)
		} finally {
			setLoading(false)
		}
	}, [userId])

	useEffect(() => {
		fetchUserData()
	}, [fetchUserData])

	const retry = useCallback(() => {
		// Limpiar cache para forzar nueva petición
		userCache.data = null
		userCache.promise = null
		userCache.timestamp = 0
		userCache.userId = null
		fetchUserData()
	}, [fetchUserData])

	return {
		userData,
		loading,
		error,
		retry,
		userRole: userData?.role?.name || null,
		isAuthenticated: !!userData && userData.status.name === 'Active',
	}
}

export const clearUserCache = () => {
	userCache.data = null
	userCache.promise = null
	userCache.timestamp = 0
	userCache.userId = null
}
