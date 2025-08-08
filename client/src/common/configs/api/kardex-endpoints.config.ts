import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const KARDEX_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.KARDEX],
	baseEndpoint: `/${ENDPOINT_API.KARDEX}`,
	extraInvalidateKeys: [],
	endpoints: {
		list: { path: '', method: 'GET' },
		lasted: { path: '/lasted', method: 'GET' },
		getById: { path: '/:id', method: 'GET', params: ['id'] },
	},
}
