import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const BRAND_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.BRAND],
	baseEndpoint: `/${ENDPOINT_API.BRAND}`,
	extraInvalidateKeys: [],
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		get: { path: '/:id', method: 'GET', params: ['id'] },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
