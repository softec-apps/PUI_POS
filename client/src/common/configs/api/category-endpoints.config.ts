import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const CATEGORY_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.CATEGORY],
	baseEndpoint: `/${ENDPOINT_API.CATEGORY}`,
	extraInvalidateKeys: [[ENDPOINT_API.TEMPLATE], [ENDPOINT_API.CATEGORY]],
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		softDelete: { path: '/:id', method: 'DELETE', params: ['id'] },
		restore: { path: '/:id/restore', method: 'PATCH', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
