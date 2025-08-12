import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const CUSTOMER_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.CUSTOMER],
	baseEndpoint: `/${ENDPOINT_API.CUSTOMER}`,
	extraInvalidateKeys: [[]],
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
