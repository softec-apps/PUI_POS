import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import { emitter } from '@/common/events/sessionEmitter-event'
import { BASE_URL_API } from '@/common/constants/baseUrl-const'

const api = axios.create({
	baseURL: BASE_URL_API,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use(
	async config => {
		const session = await getSession()
		if (session?.token) {
			config.headers.Authorization = `Bearer ${session.token}`
		}
		return config
	},
	error => Promise.reject(error)
)

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401) {
			if (!originalRequest._retry) {
				originalRequest._retry = true

				try {
					const session = await getSession()

					if (session?.token && !session.error) {
						// Reintentar con token si existe
						originalRequest.headers.Authorization = `Bearer ${session.token}`
						return api(originalRequest)
					}
				} catch (refreshError) {
					console.error('Error al intentar refrescar sesión:', refreshError)
				}

				// 👇 Forzar logout si no se puede renovar la sesión
				try {
					await axios.post(
						`${BASE_URL_API}/api/v1/auth/logout`,
						{},
						{
							headers: {
								Authorization: `Bearer ${session?.token}`,
								'Content-Type': 'application/json',
							},
						}
					)
				} catch (logoutError) {
					console.warn('Error al llamar al logout del servidor:', logoutError)
				} finally {
					emitter.emit('unauthorized') // Puedes escuchar este evento si quieres mostrar algo en el frontend
					await signOut({ redirect: false }) // Cierra sesión del cliente
				}
			}
		} else if (error.response?.status === 403) {
			emitter.emit('forbidden')
		} else if (error.response?.status >= 500) {
			const message = error.response?.data?.message || 'Error interno del servidor'
			emitter.emit('serverError', message)
		}

		return Promise.reject(error)
	}
)

export default api
