import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const SALE_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.SALE],
	baseEndpoint: `/${ENDPOINT_API.SALE}`,
	extraInvalidateKeys: [[ENDPOINT_API.SALE]],
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		hardDelete: { path: '/:id', method: 'DELETE', params: ['id'] },
	},
}
