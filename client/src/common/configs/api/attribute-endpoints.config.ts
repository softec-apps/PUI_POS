import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const ATTRIBUTE_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.ATRIBUTE],
	baseEndpoint: `/${ENDPOINT_API.ATRIBUTE}`,
	extraInvalidateKeys: [[ENDPOINT_API.TEMPLATE]],
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
