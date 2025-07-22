import axios from 'axios'
import { getSession } from 'next-auth/react'
import { emitter } from '@/common/events/sessionEmitter-event'
import { BASE_URL_API } from '@/common/constants/baseUrl-const'

const api = axios.create({
	baseURL: BASE_URL_API,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

// Request interceptor para agregar el token
api.interceptors.request.use(
	async config => {
		const session = await getSession()

		if (session?.token) config.headers.Authorization = `Bearer ${session.token}`

		return config
	},
	error => {
		return Promise.reject(error)
	}
)

// Response interceptor para manejar errores
api.interceptors.response.use(
	response => {
		return response
	},
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401) {
			// Token expirado o no válido
			if (!originalRequest._retry) {
				originalRequest._retry = true

				try {
					// Intentar obtener una nueva sesión
					const session = await getSession()

					if (session?.token && !session.error) {
						// Si tenemos un token válido, reintentar la petición
						originalRequest.headers.Authorization = `Bearer ${session.token}`
						return api(originalRequest)
					} else {
						// Si no hay token válido o hay error, emitir evento de no autorizado
						emitter.emit('unauthorized')
					}
				} catch (refreshError) {
					console.error('Error al obtener nueva sesión:', refreshError)
					emitter.emit('unauthorized')
				}
			} else {
				// Ya se intentó renovar, emitir evento de no autorizado
				emitter.emit('unauthorized')
			}
		} else if (error.response?.status === 403) {
			// Acceso prohibido
			emitter.emit('forbidden')
		} else if (error.response?.status >= 500) {
			// Error del servidor
			const message = error.response?.data?.message || 'Error interno del servidor'
			emitter.emit('serverError', message)
		}

		return Promise.reject(error)
	}
)

export default api
