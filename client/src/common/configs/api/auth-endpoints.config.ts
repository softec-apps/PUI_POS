import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const AUTH_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.AUTH],
	baseEndpoint: `/${ENDPOINT_API.AUTH}`,
	extraInvalidateKeys: [[ENDPOINT_API.SALE], [ENDPOINT_API.KARDEX]],
	endpoints: {
		// Auth endpoints
		login: { path: '/email/login', method: 'POST' },
		register: { path: '/email/register', method: 'POST' },
		confirm: { path: '/email/confirm', method: 'POST' },
		confirmNew: { path: '/email/confirm/new', method: 'POST' },
		forgotPassword: { path: '/forgot/password', method: 'POST' },
		resetPassword: { path: '/reset/password', method: 'POST' },
		me: { path: '/me', method: 'GET' },
		updateMe: { path: '/me', method: 'PATCH' },
		deleteMe: { path: '/me', method: 'DELETE' },
		refresh: { path: '/refresh', method: 'POST' },
		logout: { path: '/logout', method: 'POST' },
		googleLogin: { path: '/google/login', method: 'POST' },

		// Generic CRUD endpoints (manteniendo compatibilidad)
		list: { path: '', method: 'GET' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		softDelete: { path: '/:id', method: 'DELETE', params: ['id'] },
		restore: { path: '/:id/restore', method: 'PATCH', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
