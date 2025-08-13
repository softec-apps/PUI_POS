import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const CUSTOMER_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.CUSTOMER],
	baseEndpoint: `/${ENDPOINT_API.CUSTOMER}`,
	extraInvalidateKeys: [[]],
	endpoints: {
		list: { path: '', method: 'GET' },
		getById: { path: '/:id', method: 'GET', params: ['id'] },
		getPurchases: { path: '/:id/purchases', method: 'GET', params: ['id'] },
		getSales: { path: '/:id/sales', method: 'GET', params: ['id'] },
		getQuotes: { path: '/:id/quotes', method: 'GET', params: ['id'] },
		getProformas: { path: '/:id/proformas', method: 'GET', params: ['id'] },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
